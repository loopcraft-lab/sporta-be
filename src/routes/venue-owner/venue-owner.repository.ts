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
  VenueOwnerType
} from './venue-owner.model'

@Injectable()
@SerializeAll()
export class VenueOwnerRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list(pagination: PaginationQueryType): Promise<GetVenueOwnersResType> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit
    const [totalItems, data] = await Promise.all([
      this.prismaService.venueOwner.count({
        where: { deletedAt: null }
      }),
      this.prismaService.venueOwner.findMany({
        where: { deletedAt: null },
        skip,
        take
      })
    ])
    return {
      data,
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
      where: { id, deletedAt: null }
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
    updatedById
  }: {
    id: number
    data: UpdateVenueOwnerBodyType
    updatedById: number
  }) {
    return this.prismaService.venueOwner.update({
      where: { id, deletedAt: null },
      data: { ...data, updatedById }
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
        ? { verified: 'VERIFIED', rejectReason: null, approvedById }
        : { verified: 'REJECTED', rejectReason: body.rejectReason, approvedById }
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
}
