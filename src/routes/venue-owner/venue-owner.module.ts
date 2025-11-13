import { PrismaService } from '@/shared/services/prisma.service'
import { Module } from '@nestjs/common'
import { VenueOwnerController } from './venue-owner.controller'
import { VenueOwnerRepository } from './venue-owner.repository'
import { VenueOwnerService } from './venue-owner.service'
// TEMPORARY: Import admin controller here until proper routing is set up
import { AdminDashboardController } from '../admin/admin-dashboard.controller'
import { AdminDashboardService } from '../admin/admin-dashboard.service'

@Module({
  controllers: [
    VenueOwnerController,
    AdminDashboardController // TEMPORARY: Add admin controller here
  ],
  providers: [
    VenueOwnerService,
    VenueOwnerRepository,
    AdminDashboardService, // TEMPORARY: Add admin service here
    PrismaService
  ]
})
export class VenueOwnerModule {}
