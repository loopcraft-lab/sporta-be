import { Module } from '@nestjs/common'
import { VenueImageController } from './venue-image.controller'
import { VenueImageRepository } from './venue-image.repository'
import { VenueImageService } from './venue-image.service'

@Module({
  controllers: [VenueImageController],
  providers: [VenueImageService, VenueImageRepository]
})
export class VenueImageModule {}
