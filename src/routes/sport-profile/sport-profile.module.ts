import { SportProfileRepository } from '@/routes/sport-profile/sport-profile.repository'
import { Module } from '@nestjs/common'
import { SportProfileController } from './sport-profile.controller'
import { SportProfileService } from './sport-profile.service'

@Module({
  controllers: [SportProfileController],
  providers: [SportProfileService, SportProfileRepository]
})
export class SportProfileModule {}
