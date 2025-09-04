import {
  CreateRoleBodyType,
  GetRolesResType,
  RoleWithPermissionsType,
  UpdateRoleBodyType
} from '@/routes/role/role.model'
import { RoleMessage } from '@/shared/messages/role.message'
import { PaginationQueryType } from '@/shared/models/request.model'
import { RoleType } from '@/shared/models/shared-role.model'
import { PrismaService } from '@/shared/services/prisma.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class RoleRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list(pagination: PaginationQueryType): Promise<GetRolesResType> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit
    const [totalItems, data] = await Promise.all([
      this.prismaService.role.count({
        where: {
          deletedAt: null
        }
      }),
      this.prismaService.role.findMany({
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
      message: RoleMessage.ROLES_RETRIEVED_SUCCESSFULLY
    } as any
  }

  findById(id: number): Promise<RoleWithPermissionsType | null> {
    return this.prismaService.role.findUnique({
      where: {
        id,
        deletedAt: null
      },
      include: {
        permissions: {
          where: {
            deletedAt: null
          }
        }
      }
    }) as any
  }

  create({
    createdById,
    data
  }: {
    createdById: number | null
    data: CreateRoleBodyType
  }): Promise<RoleType> {
    return this.prismaService.role.create({
      data: {
        ...data,
        createdById
      }
    }) as any
  }

  async update({
    id,
    updatedById,
    data
  }: {
    id: number
    updatedById: number
    data: UpdateRoleBodyType
  }): Promise<RoleType> {
    if (data.permissionIds.length > 0) {
      const permissions = await this.prismaService.permission.findMany({
        where: {
          id: {
            in: data.permissionIds
          }
        }
      })
      const deletedPermission = permissions.filter((permission) => permission.deletedAt)
      if (deletedPermission.length > 0) {
        const deletedIds = deletedPermission.map((permission) => permission.id).join(', ')
        throw new Error(`Permission with id has been deleted: ${deletedIds}`)
      }
    }

    return this.prismaService.role.update({
      where: {
        id,
        deletedAt: null
      },
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
        permissions: {
          set: data.permissionIds.map((id) => ({ id }))
        },
        updatedById
      },
      include: {
        permissions: {
          where: {
            deletedAt: null
          }
        }
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
  ) {
    return isHard
      ? this.prismaService.role.delete({
          where: {
            id
          }
        })
      : this.prismaService.role.update({
          where: {
            id,
            deletedAt: null
          },
          data: {
            deletedAt: new Date(),
            deletedById
          }
        })
  }
}
