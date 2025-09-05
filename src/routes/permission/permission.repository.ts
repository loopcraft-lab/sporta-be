import {
  CreatePermissionBodyType,
  GetPermissionsResType,
  UpdatePermissionBodyType
} from '@/routes/permission/permission.model'
import { SerializeAll } from '@/shared/decorators/serialize.decorator'
import { PERMISSION_MESSAGE } from '@/shared/messages/permission.message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { PermissionType } from '@/shared/models/shared-permission.model'
import { PrismaService } from '@/shared/services/prisma.service'
import { Injectable } from '@nestjs/common'

@Injectable()
@SerializeAll()
export class PermissionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list(pagination: PaginationQueryType): Promise<GetPermissionsResType> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit
    const [totalItems, data] = await Promise.all([
      this.prismaService.permission.count({
        where: {
          deletedAt: null
        }
      }),
      this.prismaService.permission.findMany({
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
      message: PERMISSION_MESSAGE.LIST_SUCCESS
    } as any
  }

  findById(id: number): Promise<PermissionType | null> {
    return this.prismaService.permission.findUnique({
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
    data: CreatePermissionBodyType
  }): Promise<PermissionType> {
    return this.prismaService.permission.create({
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
    data: UpdatePermissionBodyType
  }): Promise<PermissionType & { roles: { id: number }[] }> {
    return this.prismaService.permission.update({
      where: {
        id,
        deletedAt: null
      },
      data: {
        ...data,
        updatedById
      },
      include: {
        roles: true
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
  ): Promise<PermissionType & { roles: { id: number }[] }> {
    return (
      isHard
        ? this.prismaService.permission.delete({
            where: {
              id
            },
            include: {
              roles: true
            }
          })
        : this.prismaService.permission.update({
            where: {
              id,
              deletedAt: null
            },
            data: {
              deletedAt: new Date(),
              deletedById
            },
            include: {
              roles: true
            }
          })
    ) as any
  }
}
