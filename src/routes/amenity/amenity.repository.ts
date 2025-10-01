import { SerializeAll } from '@/shared/decorators/serialize.decorator'
import { AMENITY_MESSAGE } from '@/shared/messages/amenity.message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { PrismaService } from '@/shared/services/prisma.service'
import { Injectable } from '@nestjs/common'
import {
  AmenityType,
  CreateAmenityBodyType,
  GetAmenitiesResType,
  UpdateAmenityBodyType
} from './amenity.model'

@Injectable()
@SerializeAll()
export class AmenityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(pagination: PaginationQueryType): Promise<GetAmenitiesResType> {
    const where = { deletedAt: null }
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit
    const [totalItems, data] = await Promise.all([
      this.prisma.amenity.count({ where }),
      this.prisma.amenity.findMany({ where, skip, take })
    ])
    return {
      data,
      meta: {
        totalItems,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(totalItems / pagination.limit)
      },
      message: AMENITY_MESSAGE.LIST_SUCCESS
    } as any
  }

  findById(id: number): Promise<AmenityType | null> {
    return this.prisma.amenity.findUnique({ where: { id, deletedAt: null } }) as any
  }

  create({
    data,
    createdById
  }: {
    data: CreateAmenityBodyType
    createdById: number
  }): Promise<AmenityType> {
    return this.prisma.amenity.create({ data: { ...data, createdById } }) as any
  }

  update({
    id,
    data,
    updatedById
  }: {
    id: number
    data: UpdateAmenityBodyType
    updatedById: number
  }) {
    return this.prisma.amenity.update({
      where: { id, deletedAt: null },
      data: { ...data, updatedById }
    }) as any
  }

  delete({ id, deletedById }: { id: number; deletedById: number }) {
    return this.prisma.amenity.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date(), deletedById }
    }) as any
  }
}
