import z from 'zod'

export const WardSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1).max(500),
  code: z.string().min(1).max(10),
  provinceId: z.number().int().positive(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime()
})

export const WardWithProvinceSchema = WardSchema.extend({
  province: z
    .object({
      id: z.number(),
      name: z.string(),
      code: z.string()
    })
    .optional()
})

//GET
export const GetWardsResSchema = z.object({
  data: z.array(WardWithProvinceSchema),
  message: z.string(),
  meta: z.object({
    totalItems: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number()
  })
})

export const GetWardDetailResSchema = z.object({
  data: WardWithProvinceSchema,
  message: z.string()
})

// Simple response for list by province (no pagination)
export const GetWardsByProvinceResSchema = z.object({
  data: z.array(WardSchema),
  message: z.string()
})

//CREATE
export const CreateWardBodySchema = WardSchema.pick({
  name: true,
  code: true,
  provinceId: true
}).strict()

//UPDATE
export const UpdateWardBodySchema = CreateWardBodySchema.partial()

//types
export type WardType = z.infer<typeof WardSchema>
export type WardWithProvinceType = z.infer<typeof WardWithProvinceSchema>
export type GetWardsResType = z.infer<typeof GetWardsResSchema>
export type GetWardsByProvinceResType = z.infer<typeof GetWardsByProvinceResSchema>
export type GetWardDetailResType = z.infer<typeof GetWardDetailResSchema>
export type CreateWardBodyType = z.infer<typeof CreateWardBodySchema>
export type UpdateWardBodyType = z.infer<typeof UpdateWardBodySchema>
