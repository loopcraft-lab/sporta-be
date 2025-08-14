import { PrismaService } from '@/shared/services/prisma.service'
import { Global, Module } from '@nestjs/common'

const sharedServices = [PrismaService]

@Global()
@Module({
  controllers: [],
  providers: [...sharedServices],
  exports: [...sharedServices]
})
export class SharedModule {}
