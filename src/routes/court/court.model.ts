import { CourtStatus } from '@/shared/constants/court.constant'
import z from 'zod'

export const CourtSchema = z.object({
  id: z.number().min(1).optional(),
  venueOwnerId: z.number().min(1),
  sportId: z.number().min(1),
  name: z.string().max(500).nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
  capacity: z.number().int().nonnegative().nullable().optional(),
  surface: z.string().max(500).nullable().optional(),
  indoor: z.boolean().nullable().optional(),
  status: z.enum(CourtStatus).default('INACTIVE'),
  pricePerHour: z.number().nonnegative().nullable().optional(),
  openingTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .nullable()
    .optional(),
  closingTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .nullable()
    .optional(),
  createdById: z.number().nullable().optional(),
  updatedById: z.number().nullable().optional(),
  deletedById: z.number().nullable().optional(),
  deletedAt: z.iso.datetime().nullable().optional(),
  createdAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime().optional()
})

export const GetCourtsResSchema = z.object({
  data: z.array(CourtSchema),
  message: z.string(),
  meta: z.object({
    totalItems: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number()
  })
})

export const GetCourtDetailResSchema = z.object({
  data: CourtSchema,
  message: z.string()
})

export const CreateCourtBodySchema = CourtSchema.pick({
  venueOwnerId: true,
  sportId: true,
  name: true,
  description: true,
  capacity: true,
  surface: true,
  indoor: true,
  status: true,
  pricePerHour: true,
  openingTime: true,
  closingTime: true
}).strict()

export const UpdateCourtBodySchema = CreateCourtBodySchema.partial()

export const CourtListQuerySchema = z.object({
  venueOwnerId: z.string().transform(Number).optional(),
  sportId: z.string().transform(Number).optional(),
  status: z.enum(CourtStatus).optional()
})

export type CourtType = z.infer<typeof CourtSchema>
export type GetCourtsResType = z.infer<typeof GetCourtsResSchema>
export type GetCourtDetailResType = z.infer<typeof GetCourtDetailResSchema>
export type CreateCourtBodyType = z.infer<typeof CreateCourtBodySchema>
export type UpdateCourtBodyType = z.infer<typeof UpdateCourtBodySchema>
export type CourtListQueryType = z.infer<typeof CourtListQuerySchema>
