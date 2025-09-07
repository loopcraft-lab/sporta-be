import {
  CreatePermissionBodyDTO,
  GetPermissionDetailResDTO,
  GetPermissionsResDTO,
  UpdatePermissionBodyDTO
} from '@/routes/permission/permission.dto'
import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { GetByIdParamsDTO, PaginationQueryDTO } from '@/shared/dtos/request.dto'
import { MessageResDTO } from '@/shared/dtos/response.dto'
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ZodResponse } from 'nestjs-zod'
import { PermissionService } from './permission.service'

@ApiTags('Permission')
@ApiBearerAuth()
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @ZodResponse({ type: GetPermissionsResDTO })
  list(@Query() query: PaginationQueryDTO) {
    return this.permissionService.list({
      page: query.page,
      limit: query.limit
    })
  }

  @Get(':id')
  @ZodResponse({ type: GetPermissionDetailResDTO })
  findById(@Param() params: GetByIdParamsDTO) {
    return this.permissionService.findById(params.id)
  }

  @Post()
  @ZodResponse({ type: GetPermissionDetailResDTO })
  create(@Body() body: CreatePermissionBodyDTO, @ActiveUser('userId') userId: number) {
    return this.permissionService.create({
      data: body,
      createdById: userId
    })
  }

  @Put(':id')
  @ZodResponse({ type: GetPermissionDetailResDTO })
  update(
    @Body() body: UpdatePermissionBodyDTO,
    @Param() params: GetByIdParamsDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.permissionService.update({
      data: body,
      id: params.id,
      updatedById: userId
    })
  }

  @Delete(':id')
  @ZodResponse({ type: MessageResDTO })
  delete(@Param() params: GetByIdParamsDTO, @ActiveUser('userId') userId: number) {
    return this.permissionService.delete({
      id: params.id,
      deletedById: userId
    })
  }
}
