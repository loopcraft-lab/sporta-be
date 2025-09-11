import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export class GetDistrictsByProvinceParamsDTO extends createZodDto(
  z.object({
    provinceId: z.coerce.number().int().positive()
  })
) {}

export class GetWardsByDistrictParamsDTO extends createZodDto(
  z.object({
    districtId: z.coerce.number().int().positive()
  })
) {}
