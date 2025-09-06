import { UserRepository } from '@/routes/user/user.repository'
import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository]
})
export class UserModule {}
