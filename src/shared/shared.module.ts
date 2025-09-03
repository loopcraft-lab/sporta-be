import { SharedUserRepository } from '@/shared/repositories/shared-user.repository'
import { EmailService } from '@/shared/services/email.service'
import { HashingService } from '@/shared/services/hashing.service'
import { PrismaService } from '@/shared/services/prisma.service'
import { TokenService } from '@/shared/services/token.service'
import { Global, Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'

const sharedServices = [
  PrismaService,
  TokenService,
  EmailService,
  HashingService,
  SharedUserRepository
]

@Global()
@Module({
  imports: [JwtModule],
  exports: sharedServices,
  providers: [...sharedServices]
})
export class SharedModule {}
