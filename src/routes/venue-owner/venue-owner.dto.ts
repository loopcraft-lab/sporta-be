import {
  ApproveVenueOwnerBodySchema,
  CreateVenueOwnerBodySchema,
  GetVenueOwnerDetailResSchema,
  GetVenueOwnersResSchema,
  UpdateVenueOwnerBodySchema,
  VenueOwnerListQuerySchema
} from '@/routes/venue-owner/venue-owner.model'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { createZodDto } from 'nestjs-zod'

export class GetVenueOwnersResDTO extends createZodDto(GetVenueOwnersResSchema) {}
export class GetVenueOwnerDetailResDTO extends createZodDto(
  GetVenueOwnerDetailResSchema
) {}
export class CreateVenueOwnerBodyDTO extends createZodDto(CreateVenueOwnerBodySchema) {}
export class UpdateVenueOwnerBodyDTO extends createZodDto(UpdateVenueOwnerBodySchema) {}
export class ApproveVenueOwnerBodyDTO extends createZodDto(ApproveVenueOwnerBodySchema) {}
export class VenueOwnerListQueryDTO extends createZodDto(VenueOwnerListQuerySchema) {}

// Dashboard Analytics DTOs
export class OwnerDashboardQueryDTO {
  @ApiPropertyOptional({ description: 'Start date (YYYY-MM-DD)' })
  startDate?: string

  @ApiPropertyOptional({ description: 'End date (YYYY-MM-DD)' })
  endDate?: string
}

// ==================== REVENUE TRACKING DTOs ====================

export class RevenueQueryDTO {
  @ApiPropertyOptional({ description: 'Start date (YYYY-MM-DD)' })
  startDate?: string

  @ApiPropertyOptional({ description: 'End date (YYYY-MM-DD)' })
  endDate?: string

  @ApiPropertyOptional({
    description: 'Group by period',
    enum: ['day', 'week', 'month', 'year'],
    default: 'day'
  })
  groupBy?: 'day' | 'week' | 'month' | 'year'
}

export class CourtCalendarQueryDTO {
  @ApiPropertyOptional({ description: 'Month in YYYY-MM format', example: '2025-10' })
  month?: string

  @ApiPropertyOptional({ description: 'Start date (YYYY-MM-DD)' })
  startDate?: string

  @ApiPropertyOptional({ description: 'End date (YYYY-MM-DD)' })
  endDate?: string
}

export class OwnerBookingsQueryDTO {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  page?: number

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  limit?: number

  @ApiPropertyOptional({ description: 'Filter by court ID' })
  courtId?: number

  @ApiPropertyOptional({ description: 'Filter by status' })
  status?: string

  @ApiPropertyOptional({ description: 'Filter by payment status' })
  paymentStatus?: string

  @ApiPropertyOptional({ description: 'Search by user name/email' })
  search?: string

  @ApiPropertyOptional({ description: 'Start date (YYYY-MM-DD)' })
  startDate?: string

  @ApiPropertyOptional({ description: 'End date (YYYY-MM-DD)' })
  endDate?: string
}
