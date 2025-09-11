import {
  BulkImportLocationBodySchema,
  BulkImportLocationResSchema,
  GetLocationSearchResSchema,
  LocationSearchQuerySchema
} from '@/routes/location/models/search.model'
import { createZodDto } from 'nestjs-zod'

export class LocationSearchQueryDTO extends createZodDto(LocationSearchQuerySchema) {}

export class GetLocationSearchResDTO extends createZodDto(GetLocationSearchResSchema) {}

export class BulkImportLocationBodyDTO extends createZodDto(
  BulkImportLocationBodySchema
) {}

export class BulkImportLocationResDTO extends createZodDto(BulkImportLocationResSchema) {}
