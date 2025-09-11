import z from 'zod'

export const LocationSearchItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
  type: z.enum(['province', 'ward']),
  fullPath: z.string(),
  provinceId: z.number().optional()
})

export const LocationSearchQuerySchema = z.object({
  q: z.string().min(1).max(255),
  type: z.enum(['province', 'ward', 'all']).optional().default('all'),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10)
})

export const GetLocationSearchResSchema = z.object({
  data: z.array(LocationSearchItemSchema),
  message: z.string(),
  meta: z.object({
    total: z.number(),
    query: z.string(),
    type: z.string()
  })
})

// Bulk import schemas (simplified - no districts)
export const BulkImportLocationBodySchema = z.object({
  provinces: z
    .array(
      z.object({
        name: z.string().min(1).max(500),
        code: z.string().min(1).max(10)
      })
    )
    .optional()
    .default([]),
  wards: z
    .array(
      z.object({
        name: z.string().min(1).max(500),
        code: z.string().min(1).max(10),
        provinceCode: z.string().min(1).max(10)
      })
    )
    .optional()
    .default([])
})

export const BulkImportLocationResSchema = z.object({
  data: z.object({
    provinces: z.object({
      created: z.number(),
      skipped: z.number()
    }),
    wards: z.object({
      created: z.number(),
      skipped: z.number()
    })
  }),
  message: z.string()
})

//types
export type LocationSearchItemType = z.infer<typeof LocationSearchItemSchema>
export type LocationSearchQueryType = z.infer<typeof LocationSearchQuerySchema>
export type GetLocationSearchResType = z.infer<typeof GetLocationSearchResSchema>
export type BulkImportLocationBodyType = z.infer<typeof BulkImportLocationBodySchema>
export type BulkImportLocationResType = z.infer<typeof BulkImportLocationResSchema>
