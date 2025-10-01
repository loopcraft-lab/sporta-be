import z from 'zod'

export const VenueImageSchema = z.object({
  id: z.number().min(1).optional(),
  courtId: z.number().min(1),
  url: z.string().url(),
  caption: z.string().max(1000).nullable().optional(),
  order: z.number().int().nonnegative().default(0),
  createdById: z.number().nullable().optional(),
  updatedById: z.number().nullable().optional(),
  deletedById: z.number().nullable().optional(),
  deletedAt: z.iso.datetime().nullable().optional(),
  createdAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime().optional()
})

export const GetVenueImagesResSchema = z.object({
  data: z.array(VenueImageSchema),
  message: z.string(),
  meta: z.object({
    totalItems: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number()
  })
})

export const GetVenueImageDetailResSchema = z.object({
  data: VenueImageSchema,
  message: z.string()
})

export const CreateVenueImageBodySchema = VenueImageSchema.pick({
  courtId: true,
  url: true,
  caption: true,
  order: true
}).strict()

export const UpdateVenueImageBodySchema = CreateVenueImageBodySchema.partial()

export const ReorderVenueImagesBodySchema = z.object({
  items: z
    .array(
      z.object({
        id: z.number().min(1),
        order: z.number().int().nonnegative()
      })
    )
    .min(1)
})

export type VenueImageType = z.infer<typeof VenueImageSchema>
export type GetVenueImagesResType = z.infer<typeof GetVenueImagesResSchema>
export type GetVenueImageDetailResType = z.infer<typeof GetVenueImageDetailResSchema>
export type CreateVenueImageBodyType = z.infer<typeof CreateVenueImageBodySchema>
export type UpdateVenueImageBodyType = z.infer<typeof UpdateVenueImageBodySchema>
export type ReorderVenueImagesBodyType = z.infer<typeof ReorderVenueImagesBodySchema>
