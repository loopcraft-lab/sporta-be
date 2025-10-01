import { SerializeAll } from '@/shared/decorators/serialize.decorator'
import { VENUE_IMAGE_MESSAGE } from '@/shared/messages/venue-image.message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { PrismaService } from '@/shared/services/prisma.service'
import { Injectable } from '@nestjs/common'
import {
  CreateVenueImageBodyType,
  GetVenueImagesResType,
  ReorderVenueImagesBodyType,
  UpdateVenueImageBodyType,
  VenueImageType
} from './venue-image.model'

@Injectable()
@SerializeAll()
export class VenueImageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    pagination: PaginationQueryType,
    filter?: { courtId?: number }
  ): Promise<GetVenueImagesResType> {
    const where: any = { deletedAt: null }
    if (filter?.courtId) where.courtId = filter.courtId
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit
    const [totalItems, data] = await Promise.all([
      this.prisma.venueImage.count({ where }),
      this.prisma.venueImage.findMany({ where, skip, take, orderBy: { order: 'asc' } })
    ])
    return {
      data,
      meta: {
        totalItems,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(totalItems / pagination.limit)
      },
      message: VENUE_IMAGE_MESSAGE.LIST_SUCCESS
    } as any
  }

  findById(id: number): Promise<VenueImageType | null> {
    return this.prisma.venueImage.findUnique({
      where: { id, deletedAt: null }
    }) as any
  }

  create({
    data,
    createdById
  }: {
    data: CreateVenueImageBodyType
    createdById: number
  }): Promise<VenueImageType> {
    return this.prisma.venueImage.create({
      data: { ...data, createdById }
    }) as any
  }

  update({
    id,
    data,
    updatedById
  }: {
    id: number
    data: UpdateVenueImageBodyType
    updatedById: number
  }): Promise<VenueImageType> {
    return this.prisma.venueImage.update({
      where: { id, deletedAt: null },
      data: { ...data, updatedById }
    }) as any
  }

  reorder({
    items,
    updatedById
  }: {
    items: ReorderVenueImagesBodyType['items']
    updatedById: number
  }) {
    return this.prisma.$transaction(
      items.map((item) =>
        this.prisma.venueImage.update({
          where: { id: item.id, deletedAt: null },
          data: { order: item.order, updatedById }
        })
      )
    )
  }

  delete({
    id,
    deletedById
  }: {
    id: number
    deletedById: number
  }): Promise<VenueImageType> {
    return this.prisma.venueImage.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date(), deletedById }
    }) as any
  }
}
