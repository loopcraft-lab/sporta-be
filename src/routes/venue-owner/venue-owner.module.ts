import { Module } from '@nestjs/common'
import { VenueOwnerController } from './venue-owner.controller'
import { VenueOwnerRepository } from './venue-owner.repository'
import { VenueOwnerService } from './venue-owner.service'

@Module({
  controllers: [VenueOwnerController],
  providers: [VenueOwnerService, VenueOwnerRepository]
})
export class VenueOwnerModule {}
