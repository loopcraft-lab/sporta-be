import { LocationController } from '@/routes/location/location.controller'
import { LocationRepository } from '@/routes/location/location.repository'
import { LocationService } from '@/routes/location/location.service'
import { Module } from '@nestjs/common'

@Module({
  controllers: [LocationController],
  providers: [LocationRepository, LocationService],
  exports: [LocationRepository, LocationService]
})
export class LocationModule {}
