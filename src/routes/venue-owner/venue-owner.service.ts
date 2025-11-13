import { NotFoundRecordException } from '@/shared/error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from '@/shared/helper'
import { VENUE_OWNER_MESSAGE } from '@/shared/messages/venue-owner.message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { PrismaService } from '@/shared/services/prisma.service'
import { Injectable } from '@nestjs/common'
import { format } from 'date-fns'
import {
  calculateDateRange,
  calculateGrowth,
  calculatePreviousPeriod,
  formatDateForGrouping,
  generateDateLabels,
  getRevenueSummary
} from './revenue.helper'
import { VenueOwnerAlreadyExistsException } from './venue-owner.error'
import {
  ApproveVenueOwnerBodyType,
  CreateVenueOwnerBodyType,
  UpdateVenueOwnerBodyType,
  VenueOwnerListQueryType
} from './venue-owner.model'
import { VenueOwnerRepository } from './venue-owner.repository'

@Injectable()
export class VenueOwnerService {
  constructor(
    private readonly venueOwnerRepository: VenueOwnerRepository,
    private readonly prisma: PrismaService
  ) {}

  list(pagination: PaginationQueryType, filter?: VenueOwnerListQueryType) {
    return this.venueOwnerRepository.list(pagination, filter)
  }

  async findById(id: number) {
    const vo = await this.venueOwnerRepository.findById(id)
    if (!vo) throw NotFoundRecordException
    return { data: vo, message: VENUE_OWNER_MESSAGE.DETAIL_SUCCESS }
  }

  async findByUserId(userId: number) {
    const vo = await this.venueOwnerRepository.findByUserId(userId)
    if (!vo) throw NotFoundRecordException
    return { data: vo, message: VENUE_OWNER_MESSAGE.DETAIL_SUCCESS }
  }

  async create({
    data,
    createdById
  }: {
    data: CreateVenueOwnerBodyType
    createdById: number
  }) {
    try {
      const vo = await this.venueOwnerRepository.create({ data, createdById })
      return { data: vo, message: VENUE_OWNER_MESSAGE.CREATE_SUCCESS }
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw VenueOwnerAlreadyExistsException
      }
      throw error
    }
  }

  async update({
    id,
    data,
    updatedById
  }: {
    id: number
    data: UpdateVenueOwnerBodyType
    updatedById: number
  }) {
    try {
      // FIX: Kiểm tra xem venue owner hiện tại có status là REJECTED không
      const currentVenueOwner = await this.venueOwnerRepository.findById(id)
      if (!currentVenueOwner) throw NotFoundRecordException

      // Nếu đang REJECTED và owner update lại thông tin → Tự động chuyển về PENDING
      const shouldResetToPending = currentVenueOwner.verified === 'REJECTED'

      const vo = await this.venueOwnerRepository.update({
        id,
        data,
        updatedById,
        resetToPending: shouldResetToPending
      })

      return {
        data: vo,
        message: shouldResetToPending
          ? 'Đã gửi đăng ký lại! Vui lòng đợi admin xét duyệt.'
          : VENUE_OWNER_MESSAGE.UPDATE_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException
      if (isUniqueConstraintPrismaError(error)) throw VenueOwnerAlreadyExistsException
      throw error
    }
  }

  async approve({
    id,
    body,
    approvedById
  }: {
    id: number
    body: ApproveVenueOwnerBodyType
    approvedById: number
  }) {
    try {
      const vo = await this.venueOwnerRepository.approve({ id, body, approvedById })
      return {
        data: vo,
        message: body.approve
          ? VENUE_OWNER_MESSAGE.APPROVE_SUCCESS
          : VENUE_OWNER_MESSAGE.REJECT_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.venueOwnerRepository.delete({ id, deletedById })
      return { message: VENUE_OWNER_MESSAGE.DELETE_SUCCESS }
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException
      throw error
    }
  }

  // ==================== DASHBOARD ANALYTICS ====================

  /**
   * Get owner dashboard stats
   */
  async getMyDashboard(userId: number, query: { startDate?: string; endDate?: string }) {
    const venueOwner = await this.venueOwnerRepository.findByUserId(userId)
    if (!venueOwner || !venueOwner.id) throw NotFoundRecordException

    const { startDate, endDate } = query

    // Build date filter
    const dateFilter =
      startDate && endDate
        ? {
            bookingDate: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          }
        : {}

    // Get all bookings for this venue owner's courts
    const bookings = await this.venueOwnerRepository.getBookingsByVenueOwner(
      venueOwner.id,
      dateFilter
    )

    // Calculate stats - FIX: Exclude cancelled bookings from revenue
    const totalBookings = bookings.length
    const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED').length
    const pendingBookings = bookings.filter((b) => b.status === 'PENDING').length
    const cancelledBookings = bookings.filter((b) => b.status === 'CANCELLED').length
    const completedBookings = bookings.filter((b) => b.status === 'COMPLETED').length

    // FIX: Only count revenue from non-cancelled bookings
    const totalRevenue = bookings
      .filter((b) => b.paymentStatus === 'PAID' && b.status !== 'CANCELLED')
      .reduce((sum, b) => sum + b.totalPrice, 0)

    const pendingRevenue = bookings
      .filter((b) => b.paymentStatus === 'PENDING' && b.status !== 'CANCELLED')
      .reduce((sum, b) => sum + b.totalPrice, 0)

    // Get court count
    const courtCount = await this.venueOwnerRepository.getCourtCount(venueOwner.id)

    return {
      data: {
        venueOwnerId: venueOwner.id,
        venueName: venueOwner.name,
        totalCourts: courtCount,
        bookings: {
          total: totalBookings,
          confirmed: confirmedBookings,
          pending: pendingBookings,
          cancelled: cancelledBookings,
          completed: completedBookings
        },
        revenue: {
          total: totalRevenue,
          pending: pendingRevenue
        },
        dateRange: {
          startDate: startDate || null,
          endDate: endDate || null
        }
      },
      message: 'Dashboard data fetched successfully'
    }
  }

  /**
   * Get court calendar with bookings
   * FIX: Format date properly to avoid timezone issues
   */
  async getCourtCalendar(
    userId: number,
    courtId: number,
    query: { month?: string; startDate?: string; endDate?: string }
  ) {
    const venueOwner = await this.venueOwnerRepository.findByUserId(userId)
    if (!venueOwner || !venueOwner.id) throw NotFoundRecordException

    // Verify court belongs to this venue owner
    const court = await this.venueOwnerRepository.findCourtById(courtId)
    if (!court || court.venueOwnerId !== venueOwner.id) {
      throw NotFoundRecordException
    }

    const { month, startDate, endDate } = query

    console.log('🗓️  Getting calendar for court:', courtId, 'Month:', month)

    // Build date filter
    let dateFilter: any = {}
    if (month) {
      // Month format: YYYY-MM
      const [year, monthNum] = month.split('-')
      const start = new Date(parseInt(year), parseInt(monthNum) - 1, 1)
      const end = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59)
      dateFilter = {
        bookingDate: {
          gte: start,
          lte: end
        }
      }
      console.log('📅 Date filter:', { start, end })
    } else if (startDate && endDate) {
      dateFilter = {
        bookingDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }
    }

    // Get bookings for this court
    const bookings = await this.venueOwnerRepository.getCourtBookings(courtId, dateFilter)

    console.log(`📊 Found ${bookings.length} bookings for court ${courtId}`)

    // Group bookings by date - FIX timezone issue
    const bookingsByDate: Record<string, any[]> = {}
    bookings.forEach((booking) => {
      // FIX: Use format from date-fns instead of toISOString to avoid timezone issues
      const dateKey = format(booking.bookingDate, 'yyyy-MM-dd')

      console.log('📌 Booking:', {
        id: booking.id,
        bookingDate: booking.bookingDate,
        dateKey,
        startTime: booking.startTime,
        status: booking.status
      })

      if (!bookingsByDate[dateKey]) {
        bookingsByDate[dateKey] = []
      }
      bookingsByDate[dateKey].push({
        id: booking.id,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        totalPrice: booking.totalPrice,
        user: {
          id: booking.user.id,
          name: booking.user.name,
          email: booking.user.email,
          phoneNumber: booking.user.phoneNumber
        }
      })
    })

    console.log('📦 Bookings grouped by date:', Object.keys(bookingsByDate))

    return {
      data: {
        court: {
          id: court.id,
          name: court.name,
          sport: court.sport,
          pricePerHour: court.pricePerHour,
          openingTime: court.openingTime,
          closingTime: court.closingTime
        },
        bookingsByDate
      },
      message: 'Court calendar fetched successfully'
    }
  }

  /**
   * Get all bookings for owner's courts
   */
  async getMyBookings(
    userId: number,
    query: {
      page?: number
      limit?: number
      courtId?: number
      status?: string
      paymentStatus?: string
      search?: string
      startDate?: string
      endDate?: string
    }
  ) {
    const venueOwner = await this.venueOwnerRepository.findByUserId(userId)
    if (!venueOwner || !venueOwner.id) throw NotFoundRecordException

    const page = query.page || 1
    const limit = query.limit || 20
    const skip = (page - 1) * limit

    // Build filters
    const where: any = {
      court: {
        venueOwnerId: venueOwner.id
      }
    }

    if (query.courtId) {
      where.courtId = query.courtId
    }

    if (query.status) {
      where.status = query.status
    }

    if (query.paymentStatus) {
      where.paymentStatus = query.paymentStatus
    }

    if (query.startDate && query.endDate) {
      where.bookingDate = {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate)
      }
    }

    if (query.search) {
      where.user = {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } }
        ]
      }
    }

    const [bookings, total] = await Promise.all([
      this.venueOwnerRepository.getBookingsWithFilters(where, skip, limit),
      this.venueOwnerRepository.countBookings(where)
    ])

    return {
      data: {
        bookings,
        meta: {
          totalItems: total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      },
      message: 'Bookings fetched successfully'
    }
  }

  /**
   * Get analytics data
   */
  async getMyAnalytics(userId: number, query: { startDate?: string; endDate?: string }) {
    const venueOwner = await this.venueOwnerRepository.findByUserId(userId)
    if (!venueOwner || !venueOwner.id) throw NotFoundRecordException

    const { startDate, endDate } = query

    const dateFilter =
      startDate && endDate
        ? {
            bookingDate: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          }
        : {}

    const bookings = await this.venueOwnerRepository.getBookingsByVenueOwner(
      venueOwner.id,
      dateFilter
    )

    // Revenue by sport - FIX: Exclude cancelled bookings
    const revenueBySport: Record<string, number> = {}
    const bookingsBySport: Record<string, number> = {}

    bookings.forEach((booking) => {
      // Skip cancelled bookings
      if (booking.status === 'CANCELLED') return

      const sportName = booking.court.sport?.name || 'Unknown'
      if (booking.paymentStatus === 'PAID') {
        revenueBySport[sportName] = (revenueBySport[sportName] || 0) + booking.totalPrice
      }
      bookingsBySport[sportName] = (bookingsBySport[sportName] || 0) + 1
    })

    // Revenue by court - FIX: Exclude cancelled bookings
    const revenueByCourt: Record<string, number> = {}
    const bookingsByCourt: Record<string, number> = {}

    bookings.forEach((booking) => {
      // Skip cancelled bookings
      if (booking.status === 'CANCELLED') return

      const courtName = booking.court.name || `Court ${booking.courtId}`
      if (booking.paymentStatus === 'PAID') {
        revenueByCourt[courtName] = (revenueByCourt[courtName] || 0) + booking.totalPrice
      }
      bookingsByCourt[courtName] = (bookingsByCourt[courtName] || 0) + 1
    })

    return {
      data: {
        revenueBySport,
        bookingsBySport,
        revenueByCourt,
        bookingsByCourt
      },
      message: 'Analytics data fetched successfully'
    }
  }

  // ==================== REVENUE TRACKING ====================

  /**
   * Get revenue overview with comparison to previous period
   */
  async getRevenueOverview(
    userId: number,
    query: {
      startDate?: string
      endDate?: string
      groupBy?: 'day' | 'week' | 'month' | 'year'
    }
  ) {
    // Get venue owner
    const venueOwner = await this.venueOwnerRepository.findByUserId(userId)
    if (!venueOwner || !venueOwner.id) throw NotFoundRecordException

    // Calculate date range
    const { startDate, endDate } = calculateDateRange(
      query.startDate,
      query.endDate,
      query.groupBy || 'day'
    )

    // Get current period data
    const currentPeriod = await getRevenueSummary(
      this.prisma,
      venueOwner.id,
      startDate,
      endDate
    )

    // Get previous period data for comparison
    const previousPeriodRange = calculatePreviousPeriod(startDate, endDate)
    const previousPeriod = await getRevenueSummary(
      this.prisma,
      venueOwner.id,
      previousPeriodRange.startDate,
      previousPeriodRange.endDate
    )

    // Calculate growth
    const revenueGrowth = calculateGrowth(
      currentPeriod.paidRevenue,
      previousPeriod.paidRevenue
    )
    const bookingGrowth = calculateGrowth(
      currentPeriod.paidBookings,
      previousPeriod.paidBookings
    )

    return {
      data: {
        currentPeriod,
        previousPeriod,
        growth: {
          revenueGrowth,
          bookingGrowth,
          revenueChange: currentPeriod.paidRevenue - previousPeriod.paidRevenue,
          bookingChange: currentPeriod.paidBookings - previousPeriod.paidBookings
        }
      },
      message: 'Revenue overview fetched successfully'
    }
  }

  /**
   * Get revenue time series for charts
   */
  async getRevenueTimeSeries(
    userId: number,
    query: {
      startDate?: string
      endDate?: string
      groupBy?: 'day' | 'week' | 'month' | 'year'
    }
  ) {
    const venueOwner = await this.venueOwnerRepository.findByUserId(userId)
    if (!venueOwner || !venueOwner.id) throw NotFoundRecordException

    const groupBy = query.groupBy || 'day'
    const { startDate, endDate } = calculateDateRange(
      query.startDate,
      query.endDate,
      groupBy
    )

    // Get all bookings in period - FIX: Include status to filter cancelled
    const bookings = await this.prisma.booking.findMany({
      where: {
        court: { venueOwnerId: venueOwner.id },
        bookingDate: { gte: startDate, lte: endDate }
      },
      select: {
        bookingDate: true,
        totalPrice: true,
        paymentStatus: true,
        status: true
      }
    })

    // Generate all date labels
    const dateLabels = generateDateLabels(startDate, endDate, groupBy)

    // Group bookings by date
    const dataMap = new Map<string, { revenue: number; bookings: number }>()

    // Initialize all dates with 0
    dateLabels.forEach(({ date }) => {
      dataMap.set(date, { revenue: 0, bookings: 0 })
    })

    // Fill in actual data - FIX: Exclude cancelled bookings
    bookings.forEach((booking) => {
      // Skip cancelled bookings
      if (booking.status === 'CANCELLED') return

      const dateKey = formatDateForGrouping(booking.bookingDate, groupBy)
      const current = dataMap.get(dateKey) || { revenue: 0, bookings: 0 }

      if (booking.paymentStatus === 'PAID') {
        current.revenue += booking.totalPrice
      }
      current.bookings += 1

      dataMap.set(dateKey, current)
    })

    // Convert to array with labels
    const data = dateLabels.map(({ date, label }) => {
      const stats = dataMap.get(date) || { revenue: 0, bookings: 0 }
      return {
        date,
        label,
        revenue: Math.round(stats.revenue),
        bookings: stats.bookings
      }
    })

    return {
      data,
      message: 'Revenue time series fetched successfully'
    }
  }

  /**
   * Get revenue breakdown by court
   */
  async getRevenueByCourt(
    userId: number,
    query: { startDate?: string; endDate?: string }
  ) {
    const venueOwner = await this.venueOwnerRepository.findByUserId(userId)
    if (!venueOwner || !venueOwner.id) throw NotFoundRecordException

    const { startDate, endDate } = calculateDateRange(
      query.startDate,
      query.endDate,
      'day'
    )

    // Get bookings grouped by court
    const bookings = await this.prisma.booking.findMany({
      where: {
        court: { venueOwnerId: venueOwner.id },
        bookingDate: { gte: startDate, lte: endDate }
      },
      include: {
        court: {
          include: {
            sport: true
          }
        }
      }
    })

    // Group by court
    const courtMap = new Map<
      number,
      {
        courtId: number
        courtName: string | null
        sportName: string
        totalRevenue: number
        paidRevenue: number
        pendingRevenue: number
        totalBookings: number
        paidBookings: number
      }
    >()

    // FIX: Exclude cancelled bookings from revenue
    bookings.forEach((booking) => {
      // Skip cancelled bookings
      if (booking.status === 'CANCELLED') return

      const courtId = booking.courtId
      const current = courtMap.get(courtId) || {
        courtId,
        courtName: booking.court.name,
        sportName: booking.court.sport?.name || 'Unknown',
        totalRevenue: 0,
        paidRevenue: 0,
        pendingRevenue: 0,
        totalBookings: 0,
        paidBookings: 0
      }

      current.totalBookings += 1

      if (booking.paymentStatus === 'PAID') {
        current.paidRevenue += booking.totalPrice
        current.paidBookings += 1
      } else if (booking.paymentStatus === 'PENDING') {
        current.pendingRevenue += booking.totalPrice
      }

      current.totalRevenue = current.paidRevenue + current.pendingRevenue

      courtMap.set(courtId, current)
    })

    // Convert to array and add avg booking value
    const data = Array.from(courtMap.values())
      .map((court) => ({
        ...court,
        avgBookingValue:
          court.paidBookings > 0 ? Math.round(court.paidRevenue / court.paidBookings) : 0
      }))
      .sort((a, b) => b.paidRevenue - a.paidRevenue) // Sort by revenue desc

    return {
      data,
      message: 'Revenue by court fetched successfully'
    }
  }

  /**
   * Get revenue breakdown by sport
   */
  async getRevenueBySport(
    userId: number,
    query: { startDate?: string; endDate?: string }
  ) {
    const venueOwner = await this.venueOwnerRepository.findByUserId(userId)
    if (!venueOwner || !venueOwner.id) throw NotFoundRecordException

    const { startDate, endDate } = calculateDateRange(
      query.startDate,
      query.endDate,
      'day'
    )

    // Get bookings grouped by sport
    const bookings = await this.prisma.booking.findMany({
      where: {
        court: { venueOwnerId: venueOwner.id },
        bookingDate: { gte: startDate, lte: endDate }
      },
      include: {
        court: {
          include: {
            sport: true
          }
        }
      }
    })

    // Group by sport
    const sportMap = new Map<
      number,
      {
        sportId: number
        sportName: string
        totalRevenue: number
        paidRevenue: number
        totalBookings: number
        paidBookings: number
        courtIds: Set<number>
      }
    >()

    // FIX: Exclude cancelled bookings from revenue
    bookings.forEach((booking) => {
      // Skip cancelled bookings
      if (booking.status === 'CANCELLED') return

      const sportId = booking.court.sport?.id || 0
      const sportName = booking.court.sport?.name || 'Unknown'

      const current = sportMap.get(sportId) || {
        sportId,
        sportName,
        totalRevenue: 0,
        paidRevenue: 0,
        totalBookings: 0,
        paidBookings: 0,
        courtIds: new Set<number>()
      }

      current.totalBookings += 1
      current.courtIds.add(booking.courtId)

      if (booking.paymentStatus === 'PAID') {
        current.paidRevenue += booking.totalPrice
        current.paidBookings += 1
      }

      current.totalRevenue += booking.totalPrice

      sportMap.set(sportId, current)
    })

    // Convert to array
    const data = Array.from(sportMap.values())
      .map((sport) => ({
        sportId: sport.sportId,
        sportName: sport.sportName,
        totalRevenue: Math.round(sport.totalRevenue),
        paidRevenue: Math.round(sport.paidRevenue),
        totalBookings: sport.totalBookings,
        paidBookings: sport.paidBookings,
        courtsCount: sport.courtIds.size
      }))
      .sort((a, b) => b.paidRevenue - a.paidRevenue) // Sort by revenue desc

    return {
      data,
      message: 'Revenue by sport fetched successfully'
    }
  }
}
