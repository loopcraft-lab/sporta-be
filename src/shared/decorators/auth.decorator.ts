import {
  AuthType,
  AuthTypeType,
  ConditionGuard,
  ConditionGuardType
} from '@/shared/constants/auth.constant'
import { SetMetadata } from '@nestjs/common'

export const AUTH_TYPE_KEY = 'authType'
export const SKIP_PERMISSION_CHECK_KEY = 'skipPermissionCheck'

export type AuthTypeDecoratorPayload = {
  authTypes: AuthTypeType[]
  options: { condition: ConditionGuardType }
}

export const Auth = (
  authTypes: AuthTypeType[],
  options?: { condition: ConditionGuardType }
) => {
  return SetMetadata(AUTH_TYPE_KEY, {
    authTypes,
    options: options ?? { condition: ConditionGuard.And }
  })
}

export const IsPublic = () => Auth([AuthType.None])

// NEW: Decorator để skip permission check nhưng vẫn require authentication
export const SkipPermissionCheck = () => SetMetadata(SKIP_PERMISSION_CHECK_KEY, true)
