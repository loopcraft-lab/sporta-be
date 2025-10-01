import { Module } from '@nestjs/common'
import { CourtAmenityController } from './court-amenity.controller'
import { CourtAmenityRepository } from './court-amenity.repository'
import { CourtAmenityService } from './court-amenity.service'

@Module({
  controllers: [CourtAmenityController],
  providers: [CourtAmenityService, CourtAmenityRepository]
})
export class CourtAmenityModule {}
