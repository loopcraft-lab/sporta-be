import { PrismaService } from '@/shared/services/prisma.service'
import { Injectable, NotFoundException } from '@nestjs/common'
import { endOfDay, startOfDay, subDays } from 'date-fns'
import { DashboardStatsQueryDTO } from './admin.dto'

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(query: DashboardStatsQueryDTO) {
    const { startDate, endDate } = query
    const start = startDate ? new Date(startDate) : subDays(new Date(), 30)
    const end = endDate ? new Date(endDate) : new Date()
    const dateFilter = { gte: startOfDay(start), lte: endOfDay(end) }

    const [bookings, totalRevenue, users, venueOwners] = await Promise.all([
      this.prisma.booking.count({ where: { createdAt: dateFilter } }),
      this.prisma.booking.aggregate({
        where: { createdAt: dateFilter, paymentStatus: 'PAID' },
        _sum: { totalPrice: true }
      }),
      this.prisma.user.count(),
      this.prisma.venueOwner.count()
    ])

    return {
      metrics: {
        totalBookings: bookings,
        totalRevenue: totalRevenue._sum.totalPrice || 0,
        totalUsers: users,
        totalVenueOwners: venueOwners
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
