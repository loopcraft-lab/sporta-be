import { SkillLevel } from '@/shared/constants/sport.constant'
import z from 'zod'

export const SportProfileSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  sportId: z.number().int().positive(),
  skillLevel: z.enum(SkillLevel)
})

//GET
export const GetSportProfilesResSchema = z.object({
  data: z.array(SportProfileSchema),
  message: z.string(),
  meta: z.object({
    totalItems: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number()
  })
})

export const GetSportProfileDetailResSchema = z.object({
  data: SportProfileSchema,
  message: z.string()
})

//CREATE
export const CreateSportProfileBodySchema = SportProfileSchema.pick({
  userId: true,
  sportId: true,
  skillLevel: true
}).strict()

//UPDATE
export const UpdateSportProfileBodySchema = CreateSportProfileBodySchema

//types
export type SportProfileType = z.infer<typeof SportProfileSchema>
export type GetSportProfilesResType = z.infer<typeof GetSportProfilesResSchema>
export type GetSportProfileDetailResType = z.infer<typeof GetSportProfileDetailResSchema>
export type CreateSportProfileBodyType = z.infer<typeof CreateSportProfileBodySchema>
export type UpdateSportProfileBodyType = z.infer<typeof UpdateSportProfileBodySchema>
