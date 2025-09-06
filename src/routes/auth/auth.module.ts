import { AuthRepository } from '@/routes/auth/auth.repository'
import { GoogleService } from '@/routes/auth/google.service'
import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
  controllers: [AuthController],
  providers: [AuthService, GoogleService, AuthRepository]
})
export class AuthModule {}
