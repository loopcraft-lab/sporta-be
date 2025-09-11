import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export class GetWardsByProvinceParamsDTO extends createZodDto(
  z.object({
    provinceId: z.coerce.number().int().positive()
  })
) {}
