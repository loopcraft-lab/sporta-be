import { SportRepository } from '@/routes/sport/sport.repository'
import { Module } from '@nestjs/common'
import { SportController } from './sport.controller'
import { SportService } from './sport.service'

@Module({
  controllers: [SportController],
  providers: [SportService, SportRepository]
})
export class SportModule {}
