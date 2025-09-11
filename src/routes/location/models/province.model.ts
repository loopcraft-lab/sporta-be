import z from 'zod'

export const ProvinceSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1).max(500),
  code: z.string().min(1).max(10),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime()
})

//GET
export const GetProvincesResSchema = z.object({
  data: z.array(ProvinceSchema),
  message: z.string(),
  meta: z.object({
    totalItems: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number()
  })
})

export const GetProvinceDetailResSchema = z.object({
  data: ProvinceSchema,
  message: z.string()
})

// GET provinces with districts
export const ProvinceWithDistrictsSchema = ProvinceSchema.extend({
  districts: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
        code: z.string()
      })
    )
    .optional()
})

export const GetProvinceWithDistrictsResSchema = z.object({
  data: ProvinceWithDistrictsSchema,
  message: z.string()
})

//CREATE
export const CreateProvinceBodySchema = ProvinceSchema.pick({
  name: true,
  code: true
}).strict()

//UPDATE
export const UpdateProvinceBodySchema = CreateProvinceBodySchema.partial()

//types
export type ProvinceType = z.infer<typeof ProvinceSchema>
export type ProvinceWithDistrictsType = z.infer<typeof ProvinceWithDistrictsSchema>
export type GetProvincesResType = z.infer<typeof GetProvincesResSchema>
export type GetProvinceDetailResType = z.infer<typeof GetProvinceDetailResSchema>
export type GetProvinceWithDistrictsResType = z.infer<
  typeof GetProvinceWithDistrictsResSchema
>
export type CreateProvinceBodyType = z.infer<typeof CreateProvinceBodySchema>
export type UpdateProvinceBodyType = z.infer<typeof UpdateProvinceBodySchema>
