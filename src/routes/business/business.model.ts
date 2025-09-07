import { BusinessVerificationType } from '@/shared/constants/business.constant'
import z from 'zod'

export const BusinessSchema = z.object({
  userId: z.number(),
  name: z.string().max(500),
  license: z.string().max(500).nullable().optional(),
  bankName: z.string().max(500).nullable().optional(),
  bankNumber: z.string().max(500).nullable().optional(),
  verified: z.enum(BusinessVerificationType).default(BusinessVerificationType.PENDING),
  approvedById: z.number().optional(),
  rejectReason: z.string().max(1000).optional(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime()
})

//GET
export const GetBusinessesResSchema = z.object({
  data: z.array(BusinessSchema),
  message: z.string(),
  meta: z.object({
    totalItems: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number()
  })
})

export const GetBusinessDetailResSchema = z.object({
  data: BusinessSchema,
  message: z.string()
})

//CREATE
export const CreateBusinessBodySchema = BusinessSchema.pick({
  name: true,
  license: true,
  bankName: true,
  bankNumber: true
}).strict()

//UPDATE
export const UpdateBusinessBodySchema = CreateBusinessBodySchema

//types
export type BusinessType = z.infer<typeof BusinessSchema>
export type GetBusinessesResType = z.infer<typeof GetBusinessesResSchema>
export type GetBusinessDetailResType = z.infer<typeof GetBusinessDetailResSchema>
export type CreateBusinessBodyType = z.infer<typeof CreateBusinessBodySchema>
export type UpdateBusinessBodyType = z.infer<typeof UpdateBusinessBodySchema>
