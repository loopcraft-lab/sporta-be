import {
  CreateRoleBodyDTO,
  CreateRoleResDTO,
  GetRoleDetailResDTO,
  GetRoleParamsDTO,
  GetRolesResDTO,
  UpdateRoleBodyDTO
} from '@/routes/role/role.dto'
import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { PaginationQueryDTO } from '@/shared/dtos/request.dto'
import { MessageResDTO } from '@/shared/dtos/response.dto'
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ZodResponse } from 'nestjs-zod'
import { RoleService } from './role.service'

@ApiTags('role')
@ApiBearerAuth()
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @ZodResponse({ type: GetRolesResDTO })
  // @ApiBearerAuth()
  list(@Query() query: PaginationQueryDTO) {
    return this.roleService.list({
      page: query.page,
      limit: query.limit
    })
  }

  @Get(':roleId')
  @ZodResponse({ type: GetRoleDetailResDTO })
  findById(@Param() params: GetRoleParamsDTO) {
    return this.roleService.findById(params.roleId)
  }

  @Post()
  @ZodResponse({ type: CreateRoleResDTO })
  create(@Body() body: CreateRoleBodyDTO, @ActiveUser('userId') userId: number) {
    return this.roleService.create({
      data: body,
      createdById: userId
    })
  }

  @Put(':roleId')
  @ZodResponse({ type: GetRoleDetailResDTO })
  update(
    @Body() body: UpdateRoleBodyDTO,
    @Param() params: GetRoleParamsDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.roleService.update({
      data: body,
      id: params.roleId,
      updatedById: userId
    })
  }

  @Delete(':roleId')
  @ZodResponse({ type: MessageResDTO })
  delete(@Param() params: GetRoleParamsDTO, @ActiveUser('userId') userId: number) {
    return this.roleService.delete({
      id: params.roleId,
      deletedById: userId
    })
  }
}
