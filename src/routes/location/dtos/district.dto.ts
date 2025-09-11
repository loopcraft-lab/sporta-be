import {
  CreateDistrictBodySchema,
  GetDistrictDetailResSchema,
  GetDistrictsByProvinceResSchema,
  GetDistrictsResSchema,
  GetDistrictWithWardsResSchema,
  UpdateDistrictBodySchema
} from '@/routes/location/models/district.model'
import { createZodDto } from 'nestjs-zod'

export class GetDistrictsResDTO extends createZodDto(GetDistrictsResSchema) {}

export class GetDistrictsByProvinceResDTO extends createZodDto(
  GetDistrictsByProvinceResSchema
) {}

export class GetDistrictDetailResDTO extends createZodDto(GetDistrictDetailResSchema) {}

export class GetDistrictWithWardsResDTO extends createZodDto(
  GetDistrictWithWardsResSchema
) {}

export class CreateDistrictBodyDTO extends createZodDto(CreateDistrictBodySchema) {}

export class UpdateDistrictBodyDTO extends createZodDto(UpdateDistrictBodySchema) {}
