import { RoleName } from '@/shared/constants/role.constant'
import { SerializeAll } from '@/shared/decorators/serialize.decorator'
import { RoleType } from '@/shared/models/shared-role.model'
import { PrismaService } from '@/shared/services/prisma.service'
import { Injectable } from '@nestjs/common'

@Injectable()
@SerializeAll()
export class SharedRoleRepository {
  private clientRoleId: number | null = null
  private ownerRoleId: number | null = null
  private moderatorRoleId: number | null = null
  private adminRoleId: number | null = null

  constructor(private readonly prismaService: PrismaService) {}

  private async getRole(roleName: string) {
    const role: RoleType = await this.prismaService.$queryRaw`
    SELECT * FROM "Role" WHERE name = ${roleName} AND "deletedAt" IS NULL LIMIT 1;
  `.then((res: RoleType[]) => {
      if (res.length === 0) {
        throw new Error('Role not found')
      }
      return res[0]
    })
    return role
  }

  async getClientRoleId() {
    if (this.clientRoleId) {
      return this.clientRoleId
    }
    const role = await this.getRole(RoleName.Client)

    this.clientRoleId = role.id
    return role.id
  }

  async getOwnerRoleId() {
    if (this.ownerRoleId) {
      return this.ownerRoleId
    }
    const role = await this.getRole(RoleName.Owner)
    this.ownerRoleId = role.id
    return role.id
  }

  async getModeratorRoleId() {
    if (this.moderatorRoleId) {
      return this.moderatorRoleId
    }
    const role = await this.getRole(RoleName.Moderator)
    this.moderatorRoleId = role.id
    return role.id
  }

  async getAdminRoleId() {
    if (this.adminRoleId) {
      return this.adminRoleId
    }
    const role = await this.getRole(RoleName.Admin)

    this.adminRoleId = role.id
    return role.id
  }
}
