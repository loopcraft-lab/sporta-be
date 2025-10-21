import envConfig from '@/config/env.config'
import { payOSService } from '@/shared/services/payos.service'
import { PrismaService } from '@/shared/services/prisma.service'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import {
  CheckAvailabilityQueryDTO,
  CreateBookingBodyDTO,
  GetBookingsQueryDTO
} from './booking.dto'

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculate duration in hours
   */
  private calculateDuration(startTime: string, endTime: string): number {
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)
    const start = startHour + startMin / 60
    const end = endHour + endMin / 60
    return end - start
  }

  /**
   * Check if time slot is available
   */
  async checkAvailability(query: CheckAvailabilityQueryDTO) {
    const { courtId, date } = query

    // Get court info
    const court = await this.prisma.court.findUnique({
      where: { id: courtId, deletedAt: null }
    })

    if (!court) {
      throw new NotFoundException('Court not found')
    }

    // Get existing bookings for this date
    const bookings = await this.prisma.booking.findMany({
      where: {
        courtId,
        bookingDate: new Date(date),
        status: { in: ['PENDING', 'CONFIRMED'] }
      },
      select: {
        startTime: true,
        endTime: true
      }
    })

    // Generate time slots based on court's operating hours
    const slots: Array<{
      startTime: string
      endTime: string
      available: boolean
      price: number | null
    }> = []

    // Use court's operating hours, fallback to default 08:00 - 22:00
    const openingTime = court.openingTime || '08:00'
    const closingTime = court.closingTime || '22:00'

    // Parse opening and closing hours
    const [openHour] = openingTime.split(':').map(Number)
    const [closeHour] = closingTime.split(':').map(Number)

    // Generate slots from opening to closing time (1 hour each)
    for (let hour = openHour; hour < closeHour; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`

      // Check if slot is booked
      const isBooked = bookings.some((booking) => {
        return (
          (startTime >= booking.startTime && startTime < booking.endTime) ||
          (endTime > booking.startTime && endTime <= booking.endTime) ||
          (startTime <= booking.startTime && endTime >= booking.endTime)
        )
      })

      slots.push({
        startTime,
        endTime,
        available: !isBooked,
        price: court.pricePerHour
      })
    }

    return {
      date,
      courtId,
      slots
    }
  }

  /**
   * Create booking with payment
   */
  async createBooking(userId: number, data: CreateBookingBodyDTO) {
    const { courtId, bookingDate, startTime, endTime, notes } = data

    // 1. Get court info
    const court = await this.prisma.court.findUnique({
      where: { id: courtId, deletedAt: null },
      include: {
        venueOwner: true,
        sport: true
      }
    })

    if (!court) {
      throw new NotFoundException('Court not found')
    }

    if (court.status !== 'ACTIVE') {
      throw new BadRequestException('Court is not available')
    }

    if (!court.pricePerHour) {
      throw new BadRequestException('Court price not set')
    }

    // 2. Check if slot is available
    const existingBooking = await this.prisma.booking.findFirst({
      where: {
        courtId,
        bookingDate: new Date(bookingDate),
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          {
            AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }]
          },
          {
            AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }]
          },
          {
            AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }]
          }
        ]
      }
    })

    if (existingBooking) {
      throw new BadRequestException('Time slot is already booked')
    }

    // 3. Calculate price
    const duration = this.calculateDuration(startTime, endTime)
    if (duration <= 0) {
      throw new BadRequestException('Invalid time range')
    }

    const totalPrice = duration * court.pricePerHour

    // 4. Get user info
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    // 5. Create booking
    const booking = await this.prisma.booking.create({
      data: {
        userId,
        courtId,
        bookingDate: new Date(bookingDate),
        startTime,
        endTime,
        duration,
        pricePerHour: court.pricePerHour,
        totalPrice,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        notes
      },
      include: {
        court: {
          include: {
            sport: true,
            venueOwner: true
          }
        }
      }
    })

    // 6. Create payment link with PayOS
    const orderCode = booking.id // Use booking ID as order code
    // PayOS description max 25 chars
    const description = `Dat san #${booking.id}`

    try {
      const paymentLink = await payOSService.createPaymentLink({
        orderCode,
        amount: Math.round(totalPrice), // PayOS requires integer
        description,
        returnUrl: `${envConfig.APP_URL.replace(':4000', ':3000')}/payment/success`,
        cancelUrl: `${envConfig.APP_URL.replace(':4000', ':3000')}/payment/cancel`,
        buyerName: user.name,
        buyerEmail: user.email,
        buyerPhone: user.phoneNumber
      })

      // 7. Create payment record
      await this.prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: totalPrice,
          method: 'PAYOS',
          status: 'PENDING',
          payosOrderId: orderCode.toString(),
          paymentUrl: paymentLink.checkoutUrl
        }
      })

      return {
        booking,
        paymentUrl: paymentLink.checkoutUrl
      }
    } catch (error) {
      // Rollback booking if payment link creation fails
      await this.prisma.booking.delete({ where: { id: booking.id } })
      throw new BadRequestException('Failed to create payment link')
    }
  }

  /**
   * Get user's bookings
   */
  async getMyBookings(userId: number, query: GetBookingsQueryDTO) {
    const { page, limit, status, startDate, endDate } = query
    const skip = (page - 1) * limit

    const where: any = {
      userId,
      ...(status && { status }),
      ...(startDate &&
        endDate && {
          bookingDate: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        })
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          court: {
            include: {
              sport: true,
              venueOwner: true
            }
          },
          payment: true
        }
      }),
      this.prisma.booking.count({ where })
    ])

    return {
      data: bookings,
      meta: {
        totalItems: total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  /**
   * Get booking by ID
   */
  async getBookingById(userId: number, bookingId: number) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId
      },
      include: {
        court: {
          include: {
            sport: true,
            venueOwner: true
          }
        },
        payment: true
      }
    })

    if (!booking) {
      throw new NotFoundException('Booking not found')
    }

    return booking
  }

  /**
   * Cancel booking
   */
  async cancelBooking(userId: number, bookingId: number) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId
      },
      include: { payment: true }
    })

    if (!booking) {
      throw new NotFoundException('Booking not found')
    }

    if (booking.status === 'CANCELLED') {
      throw new BadRequestException('Booking already cancelled')
    }

    if (booking.status === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel completed booking')
    }

    // Cancel payment if exists
    if (booking.payment && booking.payment.status === 'PENDING') {
      try {
        await payOSService.cancelPaymentLink(
          Number(booking.payment.payosOrderId),
          'User cancelled booking'
        )
      } catch (error) {
        console.error('Failed to cancel payment:', error)
      }
    }

    // Update booking status
    await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        paymentStatus: 'FAILED'
      }
    })

    return { message: 'Booking cancelled successfully' }
  }

  /**
   * Check and update payment status from PayOS
   */
  async checkPaymentStatus(bookingId: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true }
    })

    if (!booking) {
      throw new NotFoundException('Booking not found')
    }

    if (!booking.payment || !booking.payment.payosOrderId) {
      return booking
    }

    // Check payment status from PayOS
    try {
      const paymentInfo = await payOSService.getPaymentInfo(
        Number(booking.payment.payosOrderId)
      )

      console.log('=== PayOS Payment Info ====')
      console.log('Full response:', JSON.stringify(paymentInfo, null, 2))
      console.log('Status field:', paymentInfo.status)
      console.log('==========================')

      // PayOS uses different status values, check all possible fields
      const isPaid =
        paymentInfo.status === 'PAID' ||
        paymentInfo.status === 'paid' ||
        paymentInfo.status === 'COMPLETED' ||
        paymentInfo.status === 'completed' ||
        paymentInfo.status === 'SUCCESS' ||
        paymentInfo.status === 'success'

      // Update booking and payment based on PayOS status
      if (isPaid && booking.paymentStatus !== 'PAID') {
        await this.prisma.$transaction([
          this.prisma.payment.update({
            where: { id: booking.payment.id },
            data: {
              status: 'PAID',
              paidAt: new Date()
            }
          }),
          this.prisma.booking.update({
            where: { id: bookingId },
            data: {
              paymentStatus: 'PAID',
              status: 'CONFIRMED'
            }
          })
        ])
      } else if (paymentInfo.status === 'CANCELLED' && booking.status !== 'CANCELLED') {
        await this.prisma.$transaction([
          this.prisma.payment.update({
            where: { id: booking.payment.id },
            data: { status: 'FAILED' }
          }),
          this.prisma.booking.update({
            where: { id: bookingId },
            data: {
              paymentStatus: 'FAILED',
              status: 'CANCELLED'
            }
          })
        ])
      }

      // Fetch updated booking
      return await this.prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          court: {
            include: {
              sport: true,
              venueOwner: true
            }
          },
          payment: true
        }
      })
    } catch (error) {
      console.error('Failed to check payment status:', error)
      return booking
    }
  }
  async handlePaymentWebhook(webhookData: any) {
    // Verify webhook signature
    const isValid = await payOSService.verifyWebhookData(webhookData)
    if (!isValid) {
      throw new BadRequestException('Invalid webhook signature')
    }

    const { orderCode, code, desc } = webhookData.data

    // code: "00" = success, others = failed
    const isSuccess = code === '00'

    // Find payment by order code
    const payment = await this.prisma.payment.findFirst({
      where: { payosOrderId: orderCode.toString() },
      include: { booking: true }
    })

    if (!payment) {
      console.error('Payment not found for order:', orderCode)
      return
    }

    // Update payment and booking
    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: isSuccess ? 'PAID' : 'FAILED',
          transactionId: webhookData.data.transactionDateTime || null,
          paidAt: isSuccess ? new Date() : null
        }
      }),
      this.prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          paymentStatus: isSuccess ? 'PAID' : 'FAILED',
          status: isSuccess ? 'CONFIRMED' : 'CANCELLED'
        }
      })
    ])

    return { message: 'Webhook processed successfully' }
  }
}
