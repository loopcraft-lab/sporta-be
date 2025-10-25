import { PrismaService } from '@/shared/services/prisma.service'
import { Injectable, NotFoundException } from '@nestjs/common'
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks
} from 'date-fns'
import { DashboardStatsQueryDTO } from './admin.dto'

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(query: DashboardStatsQueryDTO) {
    const { startDate, endDate } = query
    const start = startDate ? new Date(startDate) : subDays(new Date(), 30)
    const end = endDate ? new Date(endDate) : new Date()
    const dateFilter = { gte: startOfDay(start), lte: endOfDay(end) }

    const now = new Date()
    const today = startOfDay(now)
    const yesterday = startOfDay(subDays(now, 1))
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 })
    const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })
    const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })
    const thisMonthStart = startOfMonth(now)
    const lastMonthStart = startOfMonth(subMonths(now, 1))
    const lastMonthEnd = endOfMonth(subMonths(now, 1))

    // Basic metrics
    const [bookings, totalRevenue, users, venueOwners, courts] = await Promise.all([
      this.prisma.booking.count({ where: { createdAt: dateFilter } }),
      this.prisma.booking.aggregate({
        where: { createdAt: dateFilter, paymentStatus: 'PAID' },
        _sum: { totalPrice: true }
      }),
      this.prisma.user.count(),
      this.prisma.venueOwner.count(),
      this.prisma.court.count()
    ])

    // User Analytics - New & Active Users
    const [newUsersToday, newUsersThisWeek, newUsersThisMonth, newUsersLastMonth] =
      await Promise.all([
        this.prisma.user.count({ where: { createdAt: { gte: today } } }),
        this.prisma.user.count({ where: { createdAt: { gte: thisWeekStart } } }),
        this.prisma.user.count({ where: { createdAt: { gte: thisMonthStart } } }),
        this.prisma.user.count({
          where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } }
        })
      ])

    // Active users (users who made bookings)
    const [activeUsersToday, activeUsersThisWeek, activeUsersThisMonth] =
      await Promise.all([
        this.prisma.booking.findMany({
          where: { createdAt: { gte: today } },
          select: { userId: true },
          distinct: ['userId']
        }),
        this.prisma.booking.findMany({
          where: { createdAt: { gte: thisWeekStart } },
          select: { userId: true },
          distinct: ['userId']
        }),
        this.prisma.booking.findMany({
          where: { createdAt: { gte: thisMonthStart } },
          select: { userId: true },
          distinct: ['userId']
        })
      ])

    // Return Rate & Retention
    const usersWithBookings = await this.prisma.user.findMany({
      include: {
        bookings: {
          select: { id: true, createdAt: true },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    const returningUsers = usersWithBookings.filter((u) => u.bookings.length >= 2).length
    const oneTimeUsers = usersWithBookings.filter((u) => u.bookings.length === 1).length
    const frequentUsers = usersWithBookings.filter((u) => u.bookings.length >= 5).length
    const regularUsers = usersWithBookings.filter(
      (u) => u.bookings.length >= 2 && u.bookings.length < 5
    ).length
    const returnRate = users > 0 ? (returningUsers / users) * 100 : 0

    // Revenue metrics
    const [
      revenueToday,
      revenueYesterday,
      revenueThisWeek,
      revenueLastWeek,
      revenueThisMonth,
      revenueLastMonth
    ] = await Promise.all([
      this.prisma.booking.aggregate({
        where: { createdAt: { gte: today }, paymentStatus: 'PAID' },
        _sum: { totalPrice: true }
      }),
      this.prisma.booking.aggregate({
        where: { createdAt: { gte: yesterday, lt: today }, paymentStatus: 'PAID' },
        _sum: { totalPrice: true }
      }),
      this.prisma.booking.aggregate({
        where: { createdAt: { gte: thisWeekStart }, paymentStatus: 'PAID' },
        _sum: { totalPrice: true }
      }),
      this.prisma.booking.aggregate({
        where: {
          createdAt: { gte: lastWeekStart, lte: lastWeekEnd },
          paymentStatus: 'PAID'
        },
        _sum: { totalPrice: true }
      }),
      this.prisma.booking.aggregate({
        where: { createdAt: { gte: thisMonthStart }, paymentStatus: 'PAID' },
        _sum: { totalPrice: true }
      }),
      this.prisma.booking.aggregate({
        where: {
          createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
          paymentStatus: 'PAID'
        },
        _sum: { totalPrice: true }
      })
    ])

    // Booking counts for comparison
    const [
      bookingsToday,
      bookingsYesterday,
      bookingsThisWeek,
      bookingsLastWeek,
      bookingsThisMonth,
      bookingsLastMonth
    ] = await Promise.all([
      this.prisma.booking.count({ where: { createdAt: { gte: today } } }),
      this.prisma.booking.count({ where: { createdAt: { gte: yesterday, lt: today } } }),
      this.prisma.booking.count({ where: { createdAt: { gte: thisWeekStart } } }),
      this.prisma.booking.count({
        where: { createdAt: { gte: lastWeekStart, lte: lastWeekEnd } }
      }),
      this.prisma.booking.count({ where: { createdAt: { gte: thisMonthStart } } }),
      this.prisma.booking.count({
        where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } }
      })
    ])

    // Calculate growth rates
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous) * 100
    }

    const revenueTodayVal = revenueToday._sum.totalPrice || 0
    const revenueYesterdayVal = revenueYesterday._sum.totalPrice || 0
    const revenueThisWeekVal = revenueThisWeek._sum.totalPrice || 0
    const revenueLastWeekVal = revenueLastWeek._sum.totalPrice || 0
    const revenueThisMonthVal = revenueThisMonth._sum.totalPrice || 0
    const revenueLastMonthVal = revenueLastMonth._sum.totalPrice || 0

    return {
      metrics: {
        totalBookings: bookings,
        totalRevenue: totalRevenue._sum.totalPrice || 0,
        totalUsers: users,
        totalVenueOwners: venueOwners,
        totalCourts: courts
      },
      userAnalytics: {
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        activeUsersToday: activeUsersToday.length,
        activeUsersThisWeek: activeUsersThisWeek.length,
        activeUsersThisMonth: activeUsersThisMonth.length,
        returningUsers,
        oneTimeUsers,
        frequentUsers,
        regularUsers,
        returnRate: Math.round(returnRate * 100) / 100
      },
      revenueAnalytics: {
        today: revenueTodayVal,
        yesterday: revenueYesterdayVal,
        thisWeek: revenueThisWeekVal,
        lastWeek: revenueLastWeekVal,
        thisMonth: revenueThisMonthVal,
        lastMonth: revenueLastMonthVal
      },
      growthMetrics: {
        bookings: {
          todayVsYesterday: calculateGrowth(bookingsToday, bookingsYesterday),
          thisWeekVsLastWeek: calculateGrowth(bookingsThisWeek, bookingsLastWeek),
          thisMonthVsLastMonth: calculateGrowth(bookingsThisMonth, bookingsLastMonth)
        },
        revenue: {
          todayVsYesterday: calculateGrowth(revenueTodayVal, revenueYesterdayVal),
          thisWeekVsLastWeek: calculateGrowth(revenueThisWeekVal, revenueLastWeekVal),
          thisMonthVsLastMonth: calculateGrowth(revenueThisMonthVal, revenueLastMonthVal)
        },
        users: {
          thisMonthVsLastMonth: calculateGrowth(newUsersThisMonth, newUsersLastMonth)
        }
      }
    }
  }

  async getCourtRevenue(query: DashboardStatsQueryDTO) {
    const { startDate, endDate } = query
    const start = startDate ? new Date(startDate) : subDays(new Date(), 30)
    const end = endDate ? new Date(endDate) : new Date()
    const dateFilter = { gte: startOfDay(start), lte: endOfDay(end) }

    // Get all courts with their bookings
    const courts = await this.prisma.court.findMany({
      include: {
        bookings: {
          where: {
            createdAt: dateFilter,
            paymentStatus: 'PAID'
          }
        },
        venueOwner: {
          select: {
            id: true,
            name: true
          }
        },
        sport: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    const courtRevenue = courts.map((court) => {
      const totalRevenue = court.bookings.reduce(
        (sum, booking) => sum + (booking.totalPrice || 0),
        0
      )
      const totalBookings = court.bookings.length
      const avgRevenuePerBooking = totalBookings > 0 ? totalRevenue / totalBookings : 0

      return {
        courtId: court.id,
        courtName: court.name,
        venueName: court.venueOwner.name,
        venueOwnerId: court.venueOwner.id,
        sportType: court.sport?.name || 'Unknown',
        totalRevenue,
        totalBookings,
        avgRevenuePerBooking: Math.round(avgRevenuePerBooking),
        pricePerHour: court.pricePerHour || 0
      }
    })

    // Sort by revenue descending
    courtRevenue.sort((a, b) => b.totalRevenue - a.totalRevenue)

    return {
      data: courtRevenue,
      summary: {
        totalCourts: courts.length,
        totalRevenue: courtRevenue.reduce((sum, c) => sum + c.totalRevenue, 0),
        totalBookings: courtRevenue.reduce((sum, c) => sum + c.totalBookings, 0)
      }
    }
  }

  async getCourtUtilization(query: DashboardStatsQueryDTO) {
    const { startDate, endDate } = query
    const start = startDate ? new Date(startDate) : subDays(new Date(), 7)
    const end = endDate ? new Date(endDate) : new Date()
    const dateFilter = { gte: startOfDay(start), lte: endOfDay(end) }

    const courts = await this.prisma.court.findMany({
      where: { status: 'ACTIVE' },
      include: {
        bookings: {
          where: {
            bookingDate: dateFilter
          }
        },
        venueOwner: {
          select: {
            id: true,
            name: true
          }
        },
        sport: {
          select: {
            name: true
          }
        }
      }
    })

    // Calculate utilization for each court
    const courtUtilization = courts.map((court) => {
      // Calculate total available hours based on court's opening/closing times
      const daysDiff = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      )
      const openingTime = court.openingTime || '06:00'
      const closingTime = court.closingTime || '22:00'
      const [openHour] = openingTime.split(':').map(Number)
      const [closeHour] = closingTime.split(':').map(Number)
      const hoursPerDay = closeHour - openHour
      const totalHoursAvailable = hoursPerDay * daysDiff

      // Calculate booked hours
      const totalHoursBooked = court.bookings.reduce((sum, booking) => {
        const start = new Date(`1970-01-01T${booking.startTime}`)
        const end = new Date(`1970-01-01T${booking.endTime}`)
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        return sum + hours
      }, 0)

      const utilizationRate =
        totalHoursAvailable > 0 ? (totalHoursBooked / totalHoursAvailable) * 100 : 0
      const emptySlots = totalHoursAvailable - totalHoursBooked

      // Calculate revenue metrics
      const completedBookings = court.bookings.filter(
        (b) => b.status === 'COMPLETED'
      ).length
      const cancelledBookings = court.bookings.filter(
        (b) => b.status === 'CANCELLED'
      ).length
      const totalRevenue = court.bookings
        .filter((b) => b.paymentStatus === 'PAID')
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0)

      return {
        courtId: court.id,
        courtName: court.name,
        venueName: court.venueOwner.name,
        sportType: court.sport?.name || 'Unknown',
        utilizationRate: Math.round(utilizationRate * 100) / 100,
        totalHoursBooked: Math.round(totalHoursBooked * 100) / 100,
        totalHoursAvailable,
        emptySlots: Math.round(emptySlots * 100) / 100,
        totalBookings: court.bookings.length,
        completedBookings,
        cancelledBookings,
        cancellationRate:
          court.bookings.length > 0
            ? Math.round((cancelledBookings / court.bookings.length) * 100 * 100) / 100
            : 0,
        totalRevenue,
        avgPricePerHour: court.pricePerHour || 0
      }
    })

    // Sort by utilization rate descending
    courtUtilization.sort((a, b) => b.utilizationRate - a.utilizationRate)

    return {
      data: courtUtilization,
      summary: {
        avgUtilizationRate:
          courtUtilization.length > 0
            ? Math.round(
                (courtUtilization.reduce((sum, c) => sum + c.utilizationRate, 0) /
                  courtUtilization.length) *
                  100
              ) / 100
            : 0,
        totalCourts: courtUtilization.length,
        highUtilization: courtUtilization.filter((c) => c.utilizationRate >= 70).length,
        mediumUtilization: courtUtilization.filter(
          (c) => c.utilizationRate >= 40 && c.utilizationRate < 70
        ).length,
        lowUtilization: courtUtilization.filter((c) => c.utilizationRate < 40).length
      }
    }
  }

  async grantAllPermissionsToAdmin() {
    const admin = await this.prisma.role.findFirst({
      where: { name: 'ADMIN' },
      include: { permissions: true }
    })

    if (!admin) {
      throw new NotFoundException('ADMIN role not found')
    }

    const permissions = await this.prisma.permission.findMany()

    // Use Prisma implicit many-to-many
    await this.prisma.role.update({
      where: { id: admin.id },
      data: {
        permissions: {
          set: permissions.map((p) => ({ id: p.id }))
        }
      }
    })

    return {
      message: `Granted ${permissions.length} permissions to ADMIN`,
      count: permissions.length
    }
  }
}
