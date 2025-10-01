import { createZodDto } from 'nestjs-zod'
import {
  CreateCourtBodySchema,
  GetCourtDetailResSchema,
  GetCourtsResSchema,
  UpdateCourtBodySchema
} from './court.model'

export class GetCourtsResDTO extends createZodDto(GetCourtsResSchema) {}
export class GetCourtDetailResDTO extends createZodDto(GetCourtDetailResSchema) {}
export class CreateCourtBodyDTO extends createZodDto(CreateCourtBodySchema) {}
export class UpdateCourtBodyDTO extends createZodDto(UpdateCourtBodySchema) {}
