import {
  CreateSportBodySchema,
  GetSportDetailResSchema,
  GetSportsResSchema,
  UpdateSportBodySchema
} from '@/routes/sport/sport.model'
import { createZodDto } from 'nestjs-zod'

export class GetSportsResDTO extends createZodDto(GetSportsResSchema) {}

export class GetSportDetailResDTO extends createZodDto(GetSportDetailResSchema) {}

export class CreateSportBodyDTO extends createZodDto(CreateSportBodySchema) {}

export class UpdateSportBodyDTO extends createZodDto(UpdateSportBodySchema) {}
