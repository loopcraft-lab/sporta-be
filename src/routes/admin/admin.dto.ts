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

  @ApiPropertyOptional({ description: 'Filter by status' })
  status?: string

  @ApiPropertyOptional({ description: 'Filter by province ID' })
  provinceId?: number

  @ApiPropertyOptional({ description: 'Search by name/email/phone' })
  search?: string

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: ['name', 'email', 'createdAt', 'totalBookings', 'totalSpent']
  })
  sortBy?: string

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'] })
  sortOrder?: 'asc' | 'desc'
}

export class GetVenueOwnersQueryDTO {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  page?: number = 1

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  limit?: number = 20

  @ApiPropertyOptional({ description: 'Filter by verification status' })
  verified?: string

  @ApiPropertyOptional({ description: 'Filter by province ID' })
  provinceId?: number

  @ApiPropertyOptional({ description: 'Search by name/license' })
  search?: string

  @ApiPropertyOptional({ description: 'Sort by field' })
  sortBy?: string

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'] })
  sortOrder?: 'asc' | 'desc'
}

export class LocationAnalyticsQueryDTO {
  @ApiPropertyOptional({ description: 'Start date (YYYY-MM-DD)' })
  startDate?: string

  @ApiPropertyOptional({ description: 'End date (YYYY-MM-DD)' })
  endDate?: string

  @ApiPropertyOptional({ description: 'Group by: province or ward' })
  groupBy?: 'province' | 'ward'
}

export class BookingAnalyticsQueryDTO {
  @ApiPropertyOptional({ description: 'Start date (YYYY-MM-DD)' })
  startDate?: string

  @ApiPropertyOptional({ description: 'End date (YYYY-MM-DD)' })
  endDate?: string

  @ApiPropertyOptional({ description: 'Court ID for specific analysis' })
  courtId?: number

  @ApiPropertyOptional({ description: 'Venue owner ID for specific analysis' })
  venueOwnerId?: number
}

export class ApproveVenueOwnerDTO {
  @ApiPropertyOptional({ description: 'Approval notes' })
  notes?: string
}

export class RejectVenueOwnerDTO {
  @ApiPropertyOptional({ description: 'Rejection reason' })
  reason?: string
}
