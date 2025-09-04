import { SerializeAll } from '@/shared/decorators/serialize.decorator'
import { PermissionType } from '@/shared/models/shared-permission.model'
import { RoleType } from '@/shared/models/shared-role.model'
import { UserType } from '@/shared/models/shared-user.model'
import { PrismaService } from '@/shared/services/prisma.service'
import { Injectable } from '@nestjs/common'

type UserIncludeRolePermissionsType = UserType & {
  role: RoleType & { permissions: PermissionType[] }
}

export type WhereUniqueUserType = { id: number } | { email: string }

@Injectable()
@SerializeAll()
export class SharedUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findUnique(where: WhereUniqueUserType): Promise<UserType | null> {
    return this.prismaService.user.findFirst({
      where: {
        ...where,
        deletedAt: null
      }
    }) as any
  }

  findUniqueIncludeRolePermissions(
    where: WhereUniqueUserType
  ): Promise<UserIncludeRolePermissionsType | null> {
    return this.prismaService.user.findFirst({
      where: {
        ...where,
        deletedAt: null
      },
      include: {
        role: {
          include: {
            permissions: {
              where: {
                deletedAt: null
              }
            }
          }
        }
      }
    }) as any
  }

  update(where: { id: number }, data: Partial<UserType>): Promise<UserType> {
    return this.prismaService.user.update({
      where: {
        ...where,
        deletedAt: null
      },
      data: data as any
    }) as any
  }
}
