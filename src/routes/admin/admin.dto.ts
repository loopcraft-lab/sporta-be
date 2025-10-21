import { ApiPropertyOptional } from '@nestjs/swagger'

export class DashboardStatsQueryDTO {
  @ApiPropertyOptional({ description: 'Start date (YYYY-MM-DD)' })
  startDate?: string

  @ApiPropertyOptional({ description: 'End date (YYYY-MM-DD)' })
  endDate?: string
}

export class GetAllBookingsQueryDTO {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  page?: number = 1

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  limit?: number = 20

  @ApiPropertyOptional({ description: 'Filter by status' })
  status?: string

  @ApiPropertyOptional({ description: 'Filter by payment status' })
  paymentStatus?: string

  @ApiPropertyOptional({ description: 'Filter by venue owner ID' })
  venueOwnerId?: number

  @ApiPropertyOptional({ description: 'Filter by court ID' })
  courtId?: number

  @ApiPropertyOptional({ description: 'Search by user name/email' })
  search?: string

  @ApiPropertyOptional({ description: 'Start date (YYYY-MM-DD)' })
  startDate?: string

  @ApiPropertyOptional({ description: 'End date (YYYY-MM-DD)' })
  endDate?: string
}

export class GetAllUsersQueryDTO {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  page?: number = 1

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  limit?: number = 20

  @ApiPropertyOptional({ description: 'Filter by role' })
  role?: string

  @ApiPropertyOptional({ description: 'Search by name/email/phone' })
  search?: string
}

export class ApproveVenueOwnerDTO {
  @ApiPropertyOptional({ description: 'Approval notes' })
  notes?: string
}

export class RejectVenueOwnerDTO {
  @ApiPropertyOptional({ description: 'Rejection reason' })
  reason?: string
}
