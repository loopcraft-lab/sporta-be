import { UserStatus } from '@/shared/constants/auth.constant'
import { PermissionSchema } from '@/shared/models/shared-permission.model'
import { RoleSchema } from '@/shared/models/shared-role.model'
import z from 'zod'

export const UserSchema = z.object({
  id: z.number().describe('The unique identifier of the user'),
  email: z.email().describe('The email address of the user'),
  name: z.string().min(1).max(100).describe('The name of the user'),
  password: z.string().min(6).max(100).describe('The password of the user'),
  phoneNumber: z.string().min(9).max(15).describe('The phone number of the user'),
  avatar: z.string().nullable().describe('The avatar URL of the user'),
  totpSecret: z.string().nullable().describe('The TOTP secret of the user'),
  status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCKED]),
  roleId: z.number().positive(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.iso.date().nullable(),
  createdAt: z.iso.date(),
  updatedAt: z.iso.date()
})

/**
 * Áp dụng cho Response của api GET('profile') và GET('users/:userId')
 */
export const GetUserProfileResSchema = UserSchema.omit({
  password: true,
  totpSecret: true
}).extend({
  role: RoleSchema.pick({
    id: true,
    name: true
  }).extend({
    permissions: z.array(
      PermissionSchema.pick({
        id: true,
        name: true,
        module: true,
        path: true,
        method: true
      })
    )
  })
})

/**
 * Áp dụng cho Response của api PUT('profile') và PUT('users/:userId')
 */
export const UpdateProfileResSchema = UserSchema.omit({
  password: true,
  totpSecret: true
})

export type UserType = z.infer<typeof UserSchema>
export type GetUserProfileResType = z.infer<typeof GetUserProfileResSchema>
export type UpdateProfileResType = z.infer<typeof UpdateProfileResSchema>
