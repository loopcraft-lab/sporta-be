import { SportStatus } from '@/shared/constants/sport.constant'
import z from 'zod'

export const SportSchema = z.object({
  id: z.number().min(1).optional(),
  name: z.string().min(2).max(500),
  description: z.string().max(1000).nullable().optional(),
  iconUrl: z.string().max(1000).nullable().optional(),
  status: z.enum(SportStatus).default(SportStatus.INACTIVE),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime()
})

//GET
export const GetSportsResSchema = z.object({
  data: z.array(SportSchema),
  message: z.string(),
  meta: z.object({
    totalItems: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number()
  })
})

export const GetSportDetailResSchema = z.object({
  data: SportSchema,
  message: z.string()
})

//CREATE
export const CreateSportBodySchema = SportSchema.pick({
  name: true,
  description: true,
  iconUrl: true,
  status: true
}).strict()

//UPDATE
export const UpdateSportBodySchema = CreateSportBodySchema

//types
export type SportType = z.infer<typeof SportSchema>
export type GetSportsResType = z.infer<typeof GetSportsResSchema>
export type GetSportDetailResType = z.infer<typeof GetSportDetailResSchema>
export type CreateSportBodyType = z.infer<typeof CreateSportBodySchema>
export type UpdateSportBodyType = z.infer<typeof UpdateSportBodySchema>
