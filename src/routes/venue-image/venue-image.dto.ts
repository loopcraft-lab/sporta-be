import { createZodDto } from 'nestjs-zod'
import {
  CreateVenueImageBodySchema,
  GetVenueImageDetailResSchema,
  GetVenueImagesResSchema,
  ReorderVenueImagesBodySchema,
  UpdateVenueImageBodySchema
} from './venue-image.model'

export class GetVenueImagesResDTO extends createZodDto(GetVenueImagesResSchema) {}
export class GetVenueImageDetailResDTO extends createZodDto(
  GetVenueImageDetailResSchema
) {}
export class CreateVenueImageBodyDTO extends createZodDto(CreateVenueImageBodySchema) {}
export class UpdateVenueImageBodyDTO extends createZodDto(UpdateVenueImageBodySchema) {}
export class ReorderVenueImagesBodyDTO extends createZodDto(
  ReorderVenueImagesBodySchema
) {}
