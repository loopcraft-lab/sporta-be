import { createZodDto } from 'nestjs-zod'
import {
  CreateAmenityBodySchema,
  GetAmenitiesResSchema,
  GetAmenityDetailResSchema,
  UpdateAmenityBodySchema
} from './amenity.model'

export class GetAmenitiesResDTO extends createZodDto(GetAmenitiesResSchema) {}
export class GetAmenityDetailResDTO extends createZodDto(GetAmenityDetailResSchema) {}
export class CreateAmenityBodyDTO extends createZodDto(CreateAmenityBodySchema) {}
export class UpdateAmenityBodyDTO extends createZodDto(UpdateAmenityBodySchema) {}
