import { PrismaService } from '@/shared/services/prisma.service'
import { Injectable } from '@nestjs/common'
import { endOfDay, startOfDay } from 'date-fns'

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get court revenue - MAIN FUNCTION FOR ADMIN REVENUE PAGE
   */
  async getCourtRevenue(query: { startDate?: string; endDate?: string }) {
    // Build date filter
    const dateFilter = this.buildDateFilter(query.startDate, query.endDate)

    // Get all bookings with court and venue info
    // IMPORTANT: Exclude CANCELLED bookings from revenue calculation
    const bookings = await this.prisma.booking.findMany({
      where: {
        ...dateFilter,
        status: { not: 'CANCELLED' }, // FIX: Don't count cancelled bookings
        paymentStatus: 'PAID' // Only count paid bookings for revenue
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

    // Group by court and calculate stats
    const courtMap = new Map<number, any>()

    bookings.forEach((booking) => {
      const courtId = booking.courtId
      const court = booking.court

      if (!courtMap.has(courtId)) {
        courtMap.set(courtId, {
          courtId,
          courtName: court.name || `Sân ${courtId}`,
          venueName: court.venueOwner?.name || 'Unknown',
          venueOwnerId: court.venueOwnerId,
          sportType: court.sport?.name || 'Unknown',
          province: null, // TODO: Need to join with Province table using provinceId
          district: null, // TODO: Need to join with District table using districtId
          totalRevenue: 0,
          totalBookings: 0,
          pricePerHour: court.pricePerHour
        })
      }

      const current = courtMap.get(courtId)!
      current.totalRevenue += booking.totalPrice
      current.totalBookings += 1
    })

    // Convert to array and calculate avg
    const data = Array.from(courtMap.values()).map((court) => ({
      ...court,
      avgRevenuePerBooking:
        court.totalBookings > 0 ? Math.round(court.totalRevenue / court.totalBookings) : 0
    }))

    // Sort by revenue descending
    data.sort((a, b) => b.totalRevenue - a.totalRevenue)

    // Calculate summary
    const summary = {
      totalRevenue: data.reduce((sum, c) => sum + c.totalRevenue, 0),
      totalBookings: data.reduce((sum, c) => sum + c.totalBookings, 0),
      totalCourts: data.length
    }

    return {
      data,
      summary,
      message: 'Court revenue fetched successfully'
    }
  }

  /**
   * Get dashboard stats overview
   */
  async getDashboardStats(query: { startDate?: string; endDate?: string }) {
    const dateFilter = this.buildDateFilter(query.startDate, query.endDate)

    console.log('📊 Admin Dashboard Stats - Date Filter:', dateFilter)

    // Get metrics
    const [totalBookings, totalRevenue, totalUsers, totalVenueOwners, totalCourts] =
      await Promise.all([
        // Total bookings (exclude cancelled)
        this.prisma.booking.count({
          where: { status: { not: 'CANCELLED' } } // Remove date filter to get ALL bookings
        }),

        // Total revenue (only paid, not cancelled)
        this.prisma.booking.aggregate({
          where: {
            paymentStatus: 'PAID',
            status: { not: 'CANCELLED' }
          },
          _sum: { totalPrice: true }
        }),

        // Total users
        this.prisma.user.count(),

        // Total venue owners
        this.prisma.venueOwner.count(),

        // Total courts
        this.prisma.court.count()
      ])

    const result = {
      data: {
        metrics: {
          totalBookings,
          totalRevenue: totalRevenue._sum.totalPrice || 0,
          totalUsers,
          totalVenueOwners,
          totalCourts
        },
        // TODO: Add these when needed
        userAnalytics: {
          newUsersToday: 0,
          newUsersThisWeek: 0,
          newUsersThisMonth: 0,
          activeUsersToday: 0,
          activeUsersThisWeek: 0,
          activeUsersThisMonth: 0,
          returningUsers: 0,
          oneTimeUsers: 0,
          frequentUsers: 0,
          regularUsers: 0,
          returnRate: 0
        },
        revenueAnalytics: {
          today: 0,
          yesterday: 0,
          thisWeek: 0,
          lastWeek: 0,
          thisMonth: 0,
          lastMonth: 0
        },
        growthMetrics: {
          bookings: {
            todayVsYesterday: 0,
            thisWeekVsLastWeek: 0,
            thisMonthVsLastMonth: 0
          },
          revenue: {
            todayVsYesterday: 0,
            thisWeekVsLastWeek: 0,
            thisMonthVsLastMonth: 0
          },
          users: {
            thisMonthVsLastMonth: 0
          }
        }
      },
      message: 'Dashboard stats fetched successfully'
    }

    console.log(
      '📊 Admin Dashboard Stats Result:',
      JSON.stringify(result.data.metrics, null, 2)
    )

    return result
  }

  /**
   * Get court utilization statistics
   */
  async getCourtUtilization(query: { startDate?: string; endDate?: string }) {
    const dateFilter = this.buildDateFilter(query.startDate, query.endDate)

    // Get all bookings
    const bookings = await this.prisma.booking.findMany({
      where: dateFilter,
      include: {
        court: {
          include: {
            sport: true,
            venueOwner: true
          }
        }
      }
    })

    // Group by court
    const courtMap = new Map<number, any>()

    bookings.forEach((booking) => {
      const courtId = booking.courtId
      const court = booking.court

      if (!courtMap.has(courtId)) {
        courtMap.set(courtId, {
          courtId,
          courtName: court.name || `Sân ${courtId}`,
          venueName: court.venueOwner?.name || 'Unknown',
          sportType: court.sport?.name || 'Unknown',
          totalBookings: 0,
          completedBookings: 0,
          cancelledBookings: 0,
          totalRevenue: 0,
          avgPricePerHour: court.pricePerHour
        })
      }

      const current = courtMap.get(courtId)!
      current.totalBookings += 1

      if (booking.status === 'COMPLETED') current.completedBookings += 1
      if (booking.status === 'CANCELLED') current.cancelledBookings += 1

      if (booking.paymentStatus === 'PAID' && booking.status !== 'CANCELLED') {
        current.totalRevenue += booking.totalPrice
      }
    })

    // Convert to array and calculate rates
    const data = Array.from(courtMap.values()).map((court) => ({
      ...court,
      cancellationRate:
        court.totalBookings > 0
          ? (court.cancelledBookings / court.totalBookings) * 100
          : 0,
      utilizationRate: 0, // TODO: Calculate based on available hours
      totalHoursBooked: 0, // TODO: Calculate
      totalHoursAvailable: 0, // TODO: Calculate
      emptySlots: 0 // TODO: Calculate
    }))

    // Sort by total bookings
    data.sort((a, b) => b.totalBookings - a.totalBookings)

    const summary = {
      totalCourts: data.length,
      avgUtilization: 0, // TODO
      avgCancellationRate:
        data.length > 0
          ? data.reduce((sum, c) => sum + c.cancellationRate, 0) / data.length
          : 0
    }

    return {
      data,
      summary,
      message: 'Court utilization fetched successfully'
    }
  }

  /**
   * Helper: Build date filter
   */
  private buildDateFilter(startDate?: string, endDate?: string) {
    if (!startDate && !endDate) return {}

    const filter: any = {}

    if (startDate) {
      filter.bookingDate = {
        ...filter.bookingDate,
        gte: startOfDay(new Date(startDate))
      }
    }

    if (endDate) {
      filter.bookingDate = {
        ...filter.bookingDate,
        lte: endOfDay(new Date(endDate))
      }
    }

    return filter
  }
}
