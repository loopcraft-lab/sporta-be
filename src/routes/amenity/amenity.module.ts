import { Module } from '@nestjs/common'
import { AmenityController } from './amenity.controller'
import { AmenityRepository } from './amenity.repository'
import { AmenityService } from './amenity.service'

@Module({
  controllers: [AmenityController],
  providers: [AmenityService, AmenityRepository]
})
export class AmenityModule {}
