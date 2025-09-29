import { RefreshTokenType } from '@/routes/auth/auth.model'
import { SerializeAll } from '@/shared/decorators/serialize.decorator'
import { WhereUniqueUserType } from '@/shared/repositories/shared-user.repository'
import { Injectable } from '@nestjs/common'
import { RoleType } from 'src/shared/models/shared-role.model'
import { UserType } from 'src/shared/models/shared-user.model'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
@SerializeAll()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  createUser(
    user: Pick<UserType, 'email' | 'name' | 'password' | 'phoneNumber' | 'roleId'>
  ): Promise<Omit<UserType, 'password' | 'totpSecret'>> {
    return this.prismaService.user.create({
      data: user,
      omit: {
        password: true,
        totpSecret: true
      }
    }) as any
  }

  createUserInclueRole(
    user: Pick<
      UserType,
      'email' | 'name' | 'password' | 'phoneNumber' | 'avatar' | 'roleId'
    >
  ): Promise<UserType & { role: RoleType }> {
    return this.prismaService.user.create({
      data: user,
      include: {
        role: true
      }
    }) as any
  }

  createRefreshToken(data: { token: string; userId: number; expiresAt: Date }) {
    return this.prismaService.refreshToken.create({
      data
    })
  }

  findUniqueUserIncludeRole(
    where: WhereUniqueUserType
  ): Promise<(UserType & { role: RoleType }) | null> {
    return this.prismaService.user.findFirst({
      where: {
        ...where,
        deletedAt: null
      },
      include: {
        role: true
      }
    }) as any
  }

  findUniqueRefreshTokenIncludeUserRole(where: {
    token: string
  }): Promise<(RefreshTokenType & { user: UserType & { role: RoleType } }) | null> {
    return this.prismaService.refreshToken.findUnique({
      where,
      include: {
        user: {
          include: {
            role: true
          }
        }
      }
    }) as any
  }

  deleteRefreshToken(where: { token: string }): Promise<RefreshTokenType> {
    return this.prismaService.refreshToken.delete({
      where
    }) as any
  }
}
