import z from 'zod'

export const CourtAmenitySchema = z.object({
  id: z.number().min(1).optional(),
  courtId: z.number().min(1),
  amenityId: z.number().min(1)
})

export const GetCourtAmenitiesResSchema = z.object({
  data: z.array(CourtAmenitySchema),
  message: z.string()
})

export const AttachCourtAmenityBodySchema = z
  .object({
    courtId: z.number().min(1),
    amenityId: z.number().min(1)
  })
  .strict()

export const DetachCourtAmenityBodySchema = AttachCourtAmenityBodySchema

export const BulkSetCourtAmenitiesBodySchema = z.object({
  courtId: z.number().min(1),
  amenityIds: z.array(z.number().min(1)).min(0)
})

export type CourtAmenityType = z.infer<typeof CourtAmenitySchema>
export type GetCourtAmenitiesResType = z.infer<typeof GetCourtAmenitiesResSchema>
export type AttachCourtAmenityBodyType = z.infer<typeof AttachCourtAmenityBodySchema>
export type DetachCourtAmenityBodyType = z.infer<typeof DetachCourtAmenityBodySchema>
export type BulkSetCourtAmenitiesBodyType = z.infer<
  typeof BulkSetCourtAmenitiesBodySchema
>
