import {
  CreateSportProfileBodySchema,
  GetSportProfileDetailResSchema,
  GetSportProfilesResSchema,
  UpdateSportProfileBodySchema
} from '@/routes/sport-profile/sport-profile.model'
import { createZodDto } from 'nestjs-zod'

export class GetSportProfilesResDTO extends createZodDto(GetSportProfilesResSchema) {}

export class GetSportProfileDetailResDTO extends createZodDto(
  GetSportProfileDetailResSchema
) {}

export class CreateSportProfileBodyDTO extends createZodDto(
  CreateSportProfileBodySchema
) {}

export class UpdateSportProfileBodyDTO extends createZodDto(
  UpdateSportProfileBodySchema
) {}
