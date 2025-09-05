import { PermissionRepository } from '@/routes/permission/permission.repository'
import { Module } from '@nestjs/common'
import { PermissionController } from './permission.controller'
import { PermissionService } from './permission.service'

@Module({
  controllers: [PermissionController],
  providers: [PermissionService, PermissionRepository]
})
export class PermissionModule {}
