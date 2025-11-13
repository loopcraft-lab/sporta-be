import { IsPublic, SkipPermissionCheck } from '@/shared/decorators/auth.decorator'
import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AdminDashboardService } from './admin-dashboard.service'

@ApiTags('Admin')
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private readonly dashboardService: AdminDashboardService) {}

  /**
   * Get court revenue statistics
   * Returns revenue data for all courts with filters
   */
  @Get('court-revenue')
  @IsPublic() // Temporary: Allow access without auth
  @SkipPermissionCheck() // Temporary: Skip permission check
  async getCourtRevenue(@Query() query: { startDate?: string; endDate?: string }) {
    return this.dashboardService.getCourtRevenue(query)
  }

  /**
   * Get dashboard statistics overview
   */
  @Get('stats')
  @IsPublic() // Temporary: Allow access without auth
  @SkipPermissionCheck() // Temporary: Skip permission check
  async getDashboardStats(@Query() query: { startDate?: string; endDate?: string }) {
    return this.dashboardService.getDashboardStats(query)
  }

  /**
   * Get court utilization statistics
   */
  @Get('court-utilization')
  @IsPublic() // Temporary: Allow access without auth
  @SkipPermissionCheck() // Temporary: Skip permission check
  async getCourtUtilization(@Query() query: { startDate?: string; endDate?: string }) {
    return this.dashboardService.getCourtUtilization(query)
  }
}
