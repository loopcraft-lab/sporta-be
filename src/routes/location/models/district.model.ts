import z from 'zod'

export const DistrictSchema = z.object({
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

export const DistrictWithProvinceSchema = DistrictSchema.extend({
  province: z
    .object({
      id: z.number(),
      name: z.string(),
      code: z.string()
    })
    .optional()
})

export const DistrictWithWardsSchema = DistrictSchema.extend({
  wards: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
        code: z.string()
      })
    )
    .optional()
})

//GET
export const GetDistrictsResSchema = z.object({
  data: z.array(DistrictWithProvinceSchema),
  message: z.string(),
  meta: z.object({
    totalItems: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number()
  })
})

export const GetDistrictDetailResSchema = z.object({
  data: DistrictWithProvinceSchema,
  message: z.string()
})

export const GetDistrictWithWardsResSchema = z.object({
  data: DistrictWithWardsSchema,
  message: z.string()
})

// Simple response for list by province (no pagination)
export const GetDistrictsByProvinceResSchema = z.object({
  data: z.array(DistrictSchema),
  message: z.string()
})

//CREATE
export const CreateDistrictBodySchema = DistrictSchema.pick({
  name: true,
  code: true,
  provinceId: true
}).strict()

//UPDATE
export const UpdateDistrictBodySchema = CreateDistrictBodySchema.partial()

//types
export type DistrictType = z.infer<typeof DistrictSchema>
export type DistrictWithProvinceType = z.infer<typeof DistrictWithProvinceSchema>
export type DistrictWithWardsType = z.infer<typeof DistrictWithWardsSchema>
export type GetDistrictsResType = z.infer<typeof GetDistrictsResSchema>
export type GetDistrictsByProvinceResType = z.infer<
  typeof GetDistrictsByProvinceResSchema
>
export type GetDistrictDetailResType = z.infer<typeof GetDistrictDetailResSchema>
export type GetDistrictWithWardsResType = z.infer<typeof GetDistrictWithWardsResSchema>
export type CreateDistrictBodyType = z.infer<typeof CreateDistrictBodySchema>
export type UpdateDistrictBodyType = z.infer<typeof UpdateDistrictBodySchema>
