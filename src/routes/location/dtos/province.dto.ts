import {
  CreateProvinceBodySchema,
  GetProvinceDetailResSchema,
  GetProvincesResSchema,
  GetProvinceWithDistrictsResSchema,
  UpdateProvinceBodySchema
} from '@/routes/location/models/province.model'
import { createZodDto } from 'nestjs-zod'

export class GetProvincesResDTO extends createZodDto(GetProvincesResSchema) {}

export class GetProvinceDetailResDTO extends createZodDto(GetProvinceDetailResSchema) {}

export class GetProvinceWithDistrictsResDTO extends createZodDto(
  GetProvinceWithDistrictsResSchema
) {}

export class CreateProvinceBodyDTO extends createZodDto(CreateProvinceBodySchema) {}

export class UpdateProvinceBodyDTO extends createZodDto(UpdateProvinceBodySchema) {}
