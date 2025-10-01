import { createZodDto } from 'nestjs-zod'
import {
  AttachCourtAmenityBodySchema,
  BulkSetCourtAmenitiesBodySchema,
  DetachCourtAmenityBodySchema,
  GetCourtAmenitiesResSchema
} from './court-amenity.model'

export class GetCourtAmenitiesResDTO extends createZodDto(GetCourtAmenitiesResSchema) {}
export class AttachCourtAmenityBodyDTO extends createZodDto(
  AttachCourtAmenityBodySchema
) {}
export class DetachCourtAmenityBodyDTO extends createZodDto(
  DetachCourtAmenityBodySchema
) {}
export class BulkSetCourtAmenitiesBodyDTO extends createZodDto(
  BulkSetCourtAmenitiesBodySchema
) {}
