import { PrismaService } from '@/shared/services/prisma.service'
import { Module } from '@nestjs/common'
import { AdminDashboardController } from './admin-dashboard.controller'
import { AdminDashboardService } from './admin-dashboard.service'

@Module({
  controllers: [AdminDashboardController],
  providers: [AdminDashboardService, PrismaService],
  exports: [AdminDashboardService]
})
export class AdminModule {}
