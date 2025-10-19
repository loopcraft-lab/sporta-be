import { PrismaService } from '@/shared/services/prisma.service'
import { Module } from '@nestjs/common'
import { BookingController } from './booking.controller'
import { BookingService } from './booking.service'

@Module({
  controllers: [BookingController],
  providers: [BookingService, PrismaService],
  exports: [BookingService]
})
export class BookingModule {}
