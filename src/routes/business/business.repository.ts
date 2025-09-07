import {
  BusinessType,
  CreateBusinessBodyType,
  GetBusinessesResType,
  UpdateBusinessBodyType
} from '@/routes/business/business.model'
import { SerializeAll } from '@/shared/decorators/serialize.decorator'
import { BUSINESS_MESSAGE } from '@/shared/messages/business.message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { PrismaService } from '@/shared/services/prisma.service'
import { Injectable } from '@nestjs/common'

@Injectable()
@SerializeAll()
export class BusinessRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list(pagination: PaginationQueryType): Promise<GetBusinessesResType> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit
    const [totalItems, data] = await Promise.all([
      this.prismaService.business.count({
        where: {
          deletedAt: null
        }
      }),
      this.prismaService.business.findMany({
        where: {
          deletedAt: null
        },
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
      message: BUSINESS_MESSAGE.LIST_SUCCESS
    } as any
  }

  findById(id: number): Promise<BusinessType | null> {
    return this.prismaService.business.findUnique({
      where: {
        userId: id,
        deletedAt: null
      }
    }) as any
  }

  create({
    createdById,
    data
  }: {
    createdById: number | null
    data: CreateBusinessBodyType
  }): Promise<BusinessType> {
    return this.prismaService.business.create({
      data: {
        userId: createdById!,
        ...data,
        createdById
      }
    }) as any
  }

  update({
    id,
    updatedById,
    data
  }: {
    id: number
    updatedById: number
    data: UpdateBusinessBodyType
  }): Promise<BusinessType> {
    return this.prismaService.business.update({
      where: {
        userId: id,
        deletedAt: null
      },
      data: {
        ...data,
        updatedById
      }
    }) as any
  }

  delete(
    {
      id,
      deletedById
    }: {
      id: number
      deletedById: number
    },
    isHard?: boolean
  ): Promise<BusinessType & { roles: { id: number }[] }> {
    return (
      isHard
        ? this.prismaService.business.delete({
            where: {
              userId: id
            }
          })
        : this.prismaService.business.update({
            where: {
              userId: id,
              deletedAt: null
            },
            data: {
              deletedAt: new Date(),
              deletedById
            }
          })
    ) as any
  }
}
