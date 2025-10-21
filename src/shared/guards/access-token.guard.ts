import { CACHE_MANAGER } from '@nestjs/cache-manager'
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Cache } from 'cache-manager'
import { keyBy } from 'lodash'
import {
  REQUEST_ROLE_PERMISSIONS,
  REQUEST_USER_KEY
} from 'src/shared/constants/auth.constant'
import { HTTPMethod } from 'src/shared/constants/role.constant'
import { SKIP_PERMISSION_CHECK_KEY } from 'src/shared/decorators/auth.decorator'
import { RolePermissionsType } from 'src/shared/models/shared-role.model'
import { PrismaService } from 'src/shared/services/prisma.service'
import { TokenService } from 'src/shared/services/token.service'
import { AccessTokenPayload } from 'src/shared/types/jwt.type'

type Permission = RolePermissionsType['permissions'][number]
type CachedRole = RolePermissionsType & {
  permissions: {
    [key: string]: Permission
  }
}

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly prismaService: PrismaService,
    private readonly reflector: Reflector,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    // Extract và validate token
    const decodedAccessToken = await this.extractAndValidateToken(request)

    // Check if we should skip permission check
    const skipPermissionCheck = this.reflector.getAllAndOverride<boolean>(
      SKIP_PERMISSION_CHECK_KEY,
      [context.getHandler(), context.getClass()]
    )

    // Nếu có decorator @SkipPermissionCheck(), chỉ check authentication, bỏ qua permission
    if (skipPermissionCheck) {
      console.log('⚠️  Skipping permission check for:', request.route.path)
      return true
    }

    // Check user permission (normal flow)
    await this.validateUserPermission(decodedAccessToken, request)
    return true
  }

  private async extractAndValidateToken(request: any): Promise<AccessTokenPayload> {
    const accessToken = this.extractAccessTokenFromHeader(request)
    try {
      const decodedAccessToken = await this.tokenService.verifyAccessToken(accessToken)

      request[REQUEST_USER_KEY] = decodedAccessToken
      return decodedAccessToken
    } catch {
      throw new UnauthorizedException('Error.InvalidAccessToken')
    }
  }

  private extractAccessTokenFromHeader(request: any): string {
    const accessToken = request.headers.authorization?.split(' ')[1]
    if (!accessToken) {
      throw new UnauthorizedException('Error.MissingAccessToken')
    }
    return accessToken
  }

  private async validateUserPermission(
    decodedAccessToken: AccessTokenPayload,
    request: any
  ): Promise<void> {
    const roleId: number = decodedAccessToken.roleId
    const roleName: string = decodedAccessToken.roleName
    const path: string = request.route.path
    const method = request.method as keyof typeof HTTPMethod
    const cacheKey = `role:${roleId}:v2` // ← Thêm :v2 để force reload

    console.log('🔍 Permission check:', {
      roleName,
      roleId,
      path,
      method,
      lookupKey: `${path}:${method}`
    })

    // 1. Thử lấy từ cache
    let cachedRole = await this.cacheManager.get<CachedRole>(cacheKey)

    // 2. Nếu không có trong cache, thì truy vấn từ cơ sở dữ liệu
    if (!cachedRole) {
      console.log('📥 Loading permissions from database for role:', roleId)

      const role = (await this.prismaService.role
        .findUniqueOrThrow({
          where: {
            id: roleId,
            deletedAt: null,
            isActive: true
          },
          include: {
            permissions: {
              where: {
                deletedAt: null
              }
            }
          }
        })
        .catch((err) => {
          console.error('❌ Role not found or inactive:', err.message)
          throw new ForbiddenException('Role not found or inactive')
        })) as unknown as RolePermissionsType

      console.log('✅ Found role with permissions:', {
        roleName: role.name,
        permissionCount: role.permissions.length
      })

      const permissionObject = keyBy(
        role.permissions,
        (permission) => `${permission.path}:${permission.method}`
      ) as CachedRole['permissions']

      cachedRole = { ...role, permissions: permissionObject }
      await this.cacheManager.set(cacheKey, cachedRole, 1000 * 60 * 60) // Cache for 1 hour

      request[REQUEST_ROLE_PERMISSIONS] = role
    } else {
      console.log('💾 Using cached permissions for role:', roleId)
    }

    // Debug: Log all available permissions
    console.log('📋 Available permissions:', Object.keys(cachedRole.permissions))

    // 3. Kiểm tra quyền truy cập
    const canAccess: Permission | undefined = cachedRole.permissions[`${path}:${method}`]

    if (!canAccess) {
      console.error('❌ Permission denied:', {
        required: `${path}:${method}`,
        available: Object.keys(cachedRole.permissions).filter((k) => k.includes(path))
      })
      throw new ForbiddenException(`Missing permission: ${method} ${path}`)
    }

    console.log('✅ Permission granted:', canAccess.name)
  }
}
