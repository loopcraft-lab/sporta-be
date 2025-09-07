import {
  CreateBusinessBodySchema,
  GetBusinessDetailResSchema,
  GetBusinessesResSchema,
  UpdateBusinessBodySchema
} from '@/routes/business/business.model'
import { createZodDto } from 'nestjs-zod'

export class GetBusinessesResDTO extends createZodDto(GetBusinessesResSchema) {}

export class GetBusinessDetailResDTO extends createZodDto(GetBusinessDetailResSchema) {}

export class CreateBusinessBodyDTO extends createZodDto(CreateBusinessBodySchema) {}

export class UpdateBusinessBodyDTO extends createZodDto(UpdateBusinessBodySchema) {}
