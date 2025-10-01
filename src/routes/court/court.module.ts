import { Module } from '@nestjs/common'
import { CourtController } from './court.controller'
import { CourtRepository } from './court.repository'
import { CourtService } from './court.service'

@Module({
  controllers: [CourtController],
  providers: [CourtService, CourtRepository],
  exports: [CourtService]
})
export class CourtModule {}
