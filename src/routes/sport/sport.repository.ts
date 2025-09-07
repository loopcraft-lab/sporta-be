import {
  CreateSportBodyType,
  GetSportsResType,
  SportType,
  UpdateSportBodyType
} from '@/routes/sport/sport.model'
import { SerializeAll } from '@/shared/decorators/serialize.decorator'
import { SPORT_MESSAGE } from '@/shared/messages/sport.message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { PrismaService } from '@/shared/services/prisma.service'
import { Injectable } from '@nestjs/common'

@Injectable()
@SerializeAll()
export class SportRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list(pagination: PaginationQueryType): Promise<GetSportsResType> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit
    const [totalItems, data] = await Promise.all([
      this.prismaService.sport.count({
        where: {
          deletedAt: null
        }
      }),
      this.prismaService.sport.findMany({
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
      message: SPORT_MESSAGE.LIST_SUCCESS
    } as any
  }

  findById(id: number): Promise<SportType | null> {
    return this.prismaService.sport.findUnique({
      where: {
        id,
        deletedAt: null
      }
    }) as any
  }

  create({
    createdById,
    data
  }: {
    createdById: number | null
    data: CreateSportBodyType
  }): Promise<SportType> {
    return this.prismaService.sport.create({
      data: {
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
    data: UpdateSportBodyType
  }): Promise<SportType & { roles: { id: number }[] }> {
    return this.prismaService.sport.update({
      where: {
        id,
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
  ): Promise<SportType> {
    return (
      isHard
        ? this.prismaService.sport.delete({
            where: {
              id
            }
          })
        : this.prismaService.sport.update({
            where: {
              id,
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
