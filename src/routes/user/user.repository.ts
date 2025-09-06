import { SerializeAll } from '@/shared/decorators/serialize.decorator'
import { USER_MESSAGE } from '@/shared/messages/user.message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'
import { CreateUserBodyType, GetUsersResType } from 'src/routes/user/user.model'
import { UserType } from 'src/shared/models/shared-user.model'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
@SerializeAll()
export class UserRepository {
  constructor(private prismaService: PrismaService) {}

  async list(pagination: PaginationQueryType): Promise<GetUsersResType> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit
    const [totalItems, data] = await Promise.all([
      this.prismaService.user.count({
        where: {
          deletedAt: null
        }
      }),
      this.prismaService.user.findMany({
        where: {
          deletedAt: null
        },
        skip,
        take,
        include: {
          role: true
        }
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
      message: USER_MESSAGE.LIST_SUCCESS
    } as any
  }

  create({
    createdById,
    data
  }: {
    createdById: number | null
    data: CreateUserBodyType
  }): Promise<UserType> {
    return this.prismaService.user.create({
      data: {
        ...data,
        createdById
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
  ): Promise<UserType> {
    return (
      isHard
        ? this.prismaService.user.delete({
            where: {
              id
            }
          })
        : this.prismaService.user.update({
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
