import { SerializeAll } from '@/shared/decorators/serialize.decorator'
import { VENUE_OWNER_MESSAGE } from '@/shared/messages/venue-owner.message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { PrismaService } from '@/shared/services/prisma.service'
import { Injectable } from '@nestjs/common'
import {
  ApproveVenueOwnerBodyType,
  CreateVenueOwnerBodyType,
  GetVenueOwnersResType,
  UpdateVenueOwnerBodyType,
  VenueOwnerListQueryType,
  VenueOwnerType
} from './venue-owner.model'

@Injectable()
@SerializeAll()
export class VenueOwnerRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list(
    pagination: PaginationQueryType,
    filter?: VenueOwnerListQueryType
  ): Promise<GetVenueOwnersResType> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit

    // Build where clause
    const where: any = { deletedAt: null }

    // Filter by verification status
    if (filter?.verified) {
      where.verified = filter.verified
    }

    // Filter by province
    if (filter?.provinceId) {
      where.provinceId = filter.provinceId
    }

    // Filter by ward
    if (filter?.wardId) {
      where.wardId = filter.wardId
    }

    // Filter by sports (venues that have courts with ANY of the specified sports)
    if (filter?.sportIds) {
      const sportIdsArray = filter.sportIds.split(',').map(Number)
      where.Court = {
        some: {
          sportId: { in: sportIdsArray },
          deletedAt: null
        }
      }
    }

    // Filter by price range (venues that have courts within price range)
    if (filter?.minPrice !== undefined || filter?.maxPrice !== undefined) {
      const priceFilter: any = { deletedAt: null }

      if (filter?.minPrice !== undefined && filter?.maxPrice !== undefined) {
        priceFilter.pricePerHour = {
          gte: filter.minPrice,
          lte: filter.maxPrice
        }
      } else if (filter?.minPrice !== undefined) {
        priceFilter.pricePerHour = { gte: filter.minPrice }
      } else if (filter?.maxPrice !== undefined) {
        priceFilter.pricePerHour = { lte: filter.maxPrice }
      }

      // Merge with existing Court filter if sportIds is also present
      if (where.Court) {
        where.Court.some = { ...where.Court.some, ...priceFilter }
      } else {
        where.Court = { some: priceFilter }
      }
    }

    // Search by name or license
    if (filter?.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { license: { contains: filter.search, mode: 'insensitive' } }
      ]
    }

    const [totalItems, data] = await Promise.all([
      this.prismaService.venueOwner.count({ where }),
      this.prismaService.venueOwner.findMany({
        where,
        skip,
        take,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phoneNumber: true
            }
          },
          approvedBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          Court: {
            where: { deletedAt: null },
            select: {
              id: true,
              sportId: true,
              pricePerHour: true,
              sport: {
                select: {
                  id: true,
                  name: true,
                  iconUrl: true
                }
              }
            }
          }
        },
        // FIX: Sort để PENDING lên đầu tiên
        orderBy: [
          // PENDING lên đầu
          {
            verified: 'asc'
          },
          // Trong PENDING: cũ nhất lên trước (FIFO - First In First Out)
          {
            createdAt: 'asc'
          }
        ]
      })
    ])

    // Additional sort để đảm bảo PENDING luôn ở đầu
    const sortedData = data.sort((a, b) => {
      // Priority 1: PENDING always first
      if (a.verified === 'PENDING' && b.verified !== 'PENDING') return -1
      if (a.verified !== 'PENDING' && b.verified === 'PENDING') return 1

      // Priority 2: Trong PENDING - đăng ký trước lên trước
      if (a.verified === 'PENDING' && b.verified === 'PENDING') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }

      // Priority 3: Trong VERIFIED/REJECTED - mới nhất lên trước
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

    return {
      data: sortedData,
      meta: {
        totalItems,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(totalItems / pagination.limit)
      },
      message: VENUE_OWNER_MESSAGE.LIST_SUCCESS
    } as any
  }

  findById(id: number): Promise<VenueOwnerType | null> {
    return this.prismaService.venueOwner.findUnique({
      where: { id, deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true
          }
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    }) as any
  }

  findByUserId(userId: number): Promise<VenueOwnerType | null> {
    return this.prismaService.venueOwner.findUnique({
      where: { userId, deletedAt: null }
    }) as any
  }

  create({ data, createdById }: { data: CreateVenueOwnerBodyType; createdById: number }) {
    return this.prismaService.venueOwner.create({
      data: { ...data, createdById }
    }) as any
  }

  update({
    id,
    data,
    updatedById,
    resetToPending = false
  }: {
    id: number
    data: UpdateVenueOwnerBodyType
    updatedById: number
    resetToPending?: boolean
  }) {
    return this.prismaService.venueOwner.update({
      where: { id, deletedAt: null },
      data: {
        ...data,
        updatedById,
        // FIX: Nếu resetToPending = true, set verified về PENDING và clear rejectReason
        ...(resetToPending && {
          verified: 'PENDING',
          rejectReason: null,
          approvedById: null
        })
      }
    }) as any
  }

  approve({
    id,
    body,
    approvedById
  }: {
    id: number
    body: ApproveVenueOwnerBodyType
    approvedById: number
  }) {
    return this.prismaService.venueOwner.update({
      where: { id, deletedAt: null },
      data: body.approve
        ? {
            verified: 'VERIFIED',
            rejectReason: null,
            approvedById,
            updatedById: approvedById
          }
        : {
            verified: 'REJECTED',
            rejectReason: body.rejectReason!,
            approvedById,
            updatedById: approvedById
          }
    }) as any
  }

  delete({ id, deletedById }: { id: number; deletedById: number }, isHard?: boolean) {
    return (
      isHard
        ? this.prismaService.venueOwner.delete({ where: { id } })
        : this.prismaService.venueOwner.update({
            where: { id, deletedAt: null },
            data: { deletedAt: new Date(), deletedById }
          })
    ) as any
  }

  // ==================== DASHBOARD ANALYTICS ====================

  /**
   * Get all bookings for a venue owner's courts
   */
  async getBookingsByVenueOwner(venueOwnerId: number, dateFilter: any = {}) {
    return this.prismaService.booking.findMany({
      where: {
        court: {
          venueOwnerId,
          deletedAt: null
        },
        ...dateFilter
      },
      include: {
        court: {
          include: {
            sport: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true
          }
        },
        payment: true
      },
      orderBy: { bookingDate: 'desc' }
    })
  }

  /**
   * Get court count for a venue owner
   */
  async getCourtCount(venueOwnerId: number) {
    return this.prismaService.court.count({
      where: { venueOwnerId, deletedAt: null }
    })
  }

  /**
   * Find court by ID
   */
  async findCourtById(courtId: number) {
    return this.prismaService.court.findUnique({
      where: { id: courtId, deletedAt: null },
      include: {
        sport: true
      }
    })
  }

  /**
   * Get bookings for a specific court
   */
  async getCourtBookings(courtId: number, dateFilter: any = {}) {
    return this.prismaService.booking.findMany({
      where: {
        courtId,
        ...dateFilter
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true
          }
        }
      },
      orderBy: [{ bookingDate: 'asc' }, { startTime: 'asc' }]
    })
  }

  /**
   * Get bookings with filters and pagination
   */
  async getBookingsWithFilters(where: any, skip: number, limit: number) {
    return this.prismaService.booking.findMany({
      where,
      skip,
      take: limit,
      include: {
        court: {
          include: {
            sport: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true
          }
        },
        payment: true
      },
      orderBy: { bookingDate: 'desc' }
    })
  }

  /**
   * Count bookings with filters
   */
  async countBookings(where: any) {
    return this.prismaService.booking.count({ where })
  }
}
