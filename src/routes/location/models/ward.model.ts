import z from 'zod'

export const WardSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1).max(500),
  code: z.string().min(1).max(10),
  districtId: z.number().int().positive(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime()
})

export const WardWithRelationsSchema = WardSchema.extend({
  district: z
    .object({
      id: z.number(),
      name: z.string(),
      code: z.string(),
      province: z
        .object({
          id: z.number(),
          name: z.string(),
          code: z.string()
        })
        .optional()
    })
    .optional()
})

//GET
export const GetWardsResSchema = z.object({
  data: z.array(WardWithRelationsSchema),
  message: z.string(),
  meta: z.object({
    totalItems: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number()
  })
})

export const GetWardDetailResSchema = z.object({
  data: WardWithRelationsSchema,
  message: z.string()
})

// Simple response for list by district (no pagination)
export const GetWardsByDistrictResSchema = z.object({
  data: z.array(WardSchema),
  message: z.string()
})

//CREATE
export const CreateWardBodySchema = WardSchema.pick({
  name: true,
  code: true,
  districtId: true
}).strict()

//UPDATE
export const UpdateWardBodySchema = CreateWardBodySchema.partial()

//types
export type WardType = z.infer<typeof WardSchema>
export type WardWithRelationsType = z.infer<typeof WardWithRelationsSchema>
export type GetWardsResType = z.infer<typeof GetWardsResSchema>
export type GetWardsByDistrictResType = z.infer<typeof GetWardsByDistrictResSchema>
export type GetWardDetailResType = z.infer<typeof GetWardDetailResSchema>
export type CreateWardBodyType = z.infer<typeof CreateWardBodySchema>
export type UpdateWardBodyType = z.infer<typeof UpdateWardBodySchema>
