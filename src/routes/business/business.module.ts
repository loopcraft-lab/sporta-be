import { BusinessRepository } from '@/routes/business/business.repository'
import { Module } from '@nestjs/common'
import { BusinessController } from './business.controller'
import { BusinessService } from './business.service'

@Module({
  controllers: [BusinessController],
  providers: [BusinessService, BusinessRepository]
})
export class BusinessModule {}
