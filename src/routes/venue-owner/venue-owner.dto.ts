import {
  ApproveVenueOwnerBodySchema,
  CreateVenueOwnerBodySchema,
  GetVenueOwnerDetailResSchema,
  GetVenueOwnersResSchema,
  UpdateVenueOwnerBodySchema,
  VenueOwnerListQuerySchema
} from '@/routes/venue-owner/venue-owner.model'
import { createZodDto } from 'nestjs-zod'

export class GetVenueOwnersResDTO extends createZodDto(GetVenueOwnersResSchema) {}
export class GetVenueOwnerDetailResDTO extends createZodDto(
  GetVenueOwnerDetailResSchema
) {}
export class CreateVenueOwnerBodyDTO extends createZodDto(CreateVenueOwnerBodySchema) {}
export class UpdateVenueOwnerBodyDTO extends createZodDto(UpdateVenueOwnerBodySchema) {}
export class ApproveVenueOwnerBodyDTO extends createZodDto(ApproveVenueOwnerBodySchema) {}
export class VenueOwnerListQueryDTO extends createZodDto(VenueOwnerListQuerySchema) {}
