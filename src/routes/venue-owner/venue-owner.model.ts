import { VenueOwnerVerificationType } from '@/shared/constants/venue-owner.constant'
import z from 'zod'

export const VenueOwnerSchema = z.object({
  id: z.number().min(1).optional(),
  userId: z.number().min(1),
  name: z.string().min(2).max(500),
  license: z.string().max(500).nullable().optional(),
  bankName: z.string().max(500).nullable().optional(),
  bankNumber: z.string().max(500).nullable().optional(),
  address: z.string().max(1000).nullable().optional(),
  provinceId: z.number().nullable().optional(),
  wardId: z.number().nullable().optional(),
  images: z.array(z.string()).default([]),
  verified: z.enum(VenueOwnerVerificationType).default('PENDING'),
  rejectReason: z.string().max(1000).nullable().optional(),
  approvedById: z.number().nullable().optional(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime().optional()
})

export const GetVenueOwnersResSchema = z.object({
  data: z.array(VenueOwnerSchema),
  message: z.string(),
  meta: z.object({
    totalItems: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number()
  })
})

export const GetVenueOwnerDetailResSchema = z.object({
  data: VenueOwnerSchema,
  message: z.string()
})

export const CreateVenueOwnerBodySchema = VenueOwnerSchema.pick({
  userId: true,
  name: true,
  license: true,
  bankName: true,
  bankNumber: true,
  address: true,
  provinceId: true,
  wardId: true,
  images: true
}).strict()

export const UpdateVenueOwnerBodySchema = CreateVenueOwnerBodySchema.partial()

// FIX: Approve schema với validation rõ ràng hơn
export const ApproveVenueOwnerBodySchema = z
  .object({
    approve: z.boolean(),
    rejectReason: z.string().min(1).max(1000).optional()
  })
  .strict()
  .superRefine((data, ctx) => {
    // Nếu approve = false (REJECT) thì BẮT BUỘC phải có rejectReason
    if (data.approve === false) {
      if (!data.rejectReason || data.rejectReason.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Reject reason is required when rejecting',
          path: ['rejectReason']
        })
      }
    }

    // Nếu approve = true (APPROVE) thì KHÔNG được có rejectReason
    if (data.approve === true && data.rejectReason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Reject reason should not be provided when approving',
        path: ['rejectReason']
      })
    }
  })

// FIX: Thêm Query Schema để filter venue owner list
export const VenueOwnerListQuerySchema = z.object({
  verified: z.enum(['PENDING', 'VERIFIED', 'REJECTED']).optional(),
  search: z.string().optional() // Search by name, license
})

export type VenueOwnerType = z.infer<typeof VenueOwnerSchema>
export type GetVenueOwnersResType = z.infer<typeof GetVenueOwnersResSchema>
export type GetVenueOwnerDetailResType = z.infer<typeof GetVenueOwnerDetailResSchema>
export type CreateVenueOwnerBodyType = z.infer<typeof CreateVenueOwnerBodySchema>
export type UpdateVenueOwnerBodyType = z.infer<typeof UpdateVenueOwnerBodySchema>
export type ApproveVenueOwnerBodyType = z.infer<typeof ApproveVenueOwnerBodySchema>
export type VenueOwnerListQueryType = z.infer<typeof VenueOwnerListQuerySchema>
