import {
  CreateProvinceBodySchema,
  GetProvinceDetailResSchema,
  GetProvincesResSchema,
  GetProvinceWithWardsResSchema,
  UpdateProvinceBodySchema
} from '@/routes/location/models/province.model'
import { createZodDto } from 'nestjs-zod'

export class GetProvincesResDTO extends createZodDto(GetProvincesResSchema) {}

export class GetProvinceDetailResDTO extends createZodDto(GetProvinceDetailResSchema) {}

export class GetProvinceWithWardsResDTO extends createZodDto(
  GetProvinceWithWardsResSchema
) {}

export class CreateProvinceBodyDTO extends createZodDto(CreateProvinceBodySchema) {}

export class UpdateProvinceBodyDTO extends createZodDto(UpdateProvinceBodySchema) {}
