import { SerializeAll } from '@/shared/decorators/serialize.decorator'
import { COURT_MESSAGE } from '@/shared/messages/court.message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { PrismaService } from '@/shared/services/prisma.service'
import { Injectable } from '@nestjs/common'
import {
  CourtListQueryType,
  CourtType,
  CreateCourtBodyType,
  GetCourtsResType,
  UpdateCourtBodyType
} from './court.model'

@Injectable()
@SerializeAll()
export class CourtRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    pagination: PaginationQueryType,
    filter?: CourtListQueryType
  ): Promise<GetCourtsResType> {
    const where: any = { deletedAt: null }
    if (filter?.venueOwnerId) where.venueOwnerId = filter.venueOwnerId
    if (filter?.sportId) where.sportId = filter.sportId
    if (filter?.status) where.status = filter.status

    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit
    const [totalItems, data] = await Promise.all([
      this.prisma.court.count({ where }),
      this.prisma.court.findMany({ where, skip, take })
    ])

    return {
      data,
      meta: {
        totalItems,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(totalItems / pagination.limit)
      },
      message: COURT_MESSAGE.LIST_SUCCESS
    } as any
  }

  findById(id: number): Promise<CourtType | null> {
    return this.prisma.court.findUnique({ where: { id, deletedAt: null } }) as any
  }

  create({
    data,
    createdById
  }: {
    data: CreateCourtBodyType
    createdById: number
  }): Promise<CourtType> {
    return this.prisma.court.create({
      data: { ...data, createdById }
    }) as any
  }

  update({
    id,
    data,
    updatedById
  }: {
    id: number
    data: UpdateCourtBodyType
    updatedById: number
  }): Promise<CourtType> {
    return this.prisma.court.update({
      where: { id, deletedAt: null },
      data: { ...data, updatedById }
    }) as any
  }

  delete({ id, deletedById }: { id: number; deletedById: number }): Promise<CourtType> {
    return this.prisma.court.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date(), deletedById }
    }) as any
  }
}
