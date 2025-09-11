import {
  CreateWardBodySchema,
  GetWardDetailResSchema,
  GetWardsByDistrictResSchema,
  GetWardsResSchema,
  UpdateWardBodySchema
} from '@/routes/location/models/ward.model'
import { createZodDto } from 'nestjs-zod'

export class GetWardsResDTO extends createZodDto(GetWardsResSchema) {}

export class GetWardsByDistrictResDTO extends createZodDto(GetWardsByDistrictResSchema) {}

export class GetWardDetailResDTO extends createZodDto(GetWardDetailResSchema) {}

export class CreateWardBodyDTO extends createZodDto(CreateWardBodySchema) {}

export class UpdateWardBodyDTO extends createZodDto(UpdateWardBodySchema) {}
