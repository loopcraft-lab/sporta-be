import { IsPublic } from '@/shared/decorators/auth.decorator'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Controller, Get, Inject, Post, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Cache } from 'cache-manager'
import { DashboardStatsQueryDTO } from './admin.dto'
import { AdminService } from './admin.service'

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  /**
   * Dashboard stats - PUBLIC for testing
   * TODO: Add @Roles('ADMIN') after fixing permissions
   */
  @Get('dashboard/stats')
  @IsPublic()
  async getDashboardStats(@Query() query: DashboardStatsQueryDTO) {
    return this.adminService.getDashboardStats(query)
  }

  @Get('dashboard/court-revenue')
  @IsPublic()
  async getCourtRevenue(@Query() query: DashboardStatsQueryDTO) {
    return this.adminService.getCourtRevenue(query)
  }

  @Get('dashboard/court-utilization')
  @IsPublic()
  async getCourtUtilization(@Query() query: DashboardStatsQueryDTO) {
    return this.adminService.getCourtUtilization(query)
  }

  @Post('grant-all-permissions')
  @IsPublic()
  async grantAllPermissions() {
    const result = await this.adminService.grantAllPermissionsToAdmin()

    for (const store of this.cacheManager.stores) {
      await store.clear()
    }

    return {
      ...result,
      note: 'Cache cleared. Please login again to refresh permissions.'
    }
  }

  @Post('clear-cache')
  @IsPublic()
  async clearCache() {
    for (const store of this.cacheManager.stores) {
      await store.clear()
    }
    return { message: 'Cache cleared successfully' }
  }
}
