import z from 'zod'

export const AmenitySchema = z.object({
  id: z.number().min(1).optional(),
  name: z.string().min(2).max(500),
  description: z.string().max(1000).nullable().optional(),
  imageUrl: z.string().max(1000).nullable().optional(),
  isActive: z.boolean().default(true),
  createdById: z.number().nullable().optional(),
  updatedById: z.number().nullable().optional(),
  deletedById: z.number().nullable().optional(),
  deletedAt: z.iso.datetime().nullable().optional(),
  createdAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime().optional()
})

export const GetAmenitiesResSchema = z.object({
  data: z.array(AmenitySchema),
  message: z.string(),
  meta: z.object({
    totalItems: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number()
  })
})

export const GetAmenityDetailResSchema = z.object({
  data: AmenitySchema,
  message: z.string()
})

export const CreateAmenityBodySchema = AmenitySchema.pick({
  name: true,
  description: true,
  imageUrl: true,
  isActive: true
}).strict()

export const UpdateAmenityBodySchema = CreateAmenityBodySchema.partial()

export type AmenityType = z.infer<typeof AmenitySchema>
export type GetAmenitiesResType = z.infer<typeof GetAmenitiesResSchema>
export type GetAmenityDetailResType = z.infer<typeof GetAmenityDetailResSchema>
export type CreateAmenityBodyType = z.infer<typeof CreateAmenityBodySchema>
export type UpdateAmenityBodyType = z.infer<typeof UpdateAmenityBodySchema>
