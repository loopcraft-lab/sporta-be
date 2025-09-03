import { RoleRepository } from '@/routes/role/role.repository'
import { Module } from '@nestjs/common'
import { RoleController } from './role.controller'
import { RoleService } from './role.service'

@Module({
  controllers: [RoleController],
  providers: [RoleService, RoleRepository]
})
export class RoleModule {}
