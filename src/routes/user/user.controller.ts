import {
  CreateUserBodyDTO,
  CreateUserResDTO,
  GetUsersResDTO,
  UpdateUserBodyDTO
} from '@/routes/user/user.dto'
import { ActiveRolePermissions } from '@/shared/decorators/active-role-permissions.decorator'
import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { GetByIdParamsDTO, PaginationQueryDTO } from '@/shared/dtos/request.dto'
import { MessageResDTO } from '@/shared/dtos/response.dto'
import { GetUserProfileResDTO, UpdateProfileResDTO } from '@/shared/dtos/shared-user.dto'
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ZodResponse } from 'nestjs-zod'
import { UserService } from './user.service'

@Controller('user')
@ApiTags('user')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ZodResponse({ type: GetUsersResDTO })
  list(@Query() query: PaginationQueryDTO) {
    return this.userService.list({
      page: query.page,
      limit: query.limit
    })
  }

  @Get(':userId')
  @ZodResponse({ type: GetUserProfileResDTO })
  findById(@Param() params: GetByIdParamsDTO) {
    return this.userService.findById(params.id)
  }

  @Post()
  @ZodResponse({ type: CreateUserResDTO })
  create(
    @Body() body: CreateUserBodyDTO,
    @ActiveUser('userId') userId: number,
    @ActiveRolePermissions('name') roleName: string
  ) {
    return this.userService.create({
      data: body,
      createdById: userId,
      createdByRoleName: roleName
    })
  }

  @Put(':userId')
  @ZodResponse({ type: UpdateProfileResDTO })
  update(
    @Body() body: UpdateUserBodyDTO,
    @Param() params: GetByIdParamsDTO,
    @ActiveUser('userId') userId: number,
    @ActiveRolePermissions('name') roleName: string
  ) {
    return this.userService.update({
      data: body,
      id: params.id,
      updatedById: userId,
      updatedByRoleName: roleName
    })
  }

  @Delete(':userId')
  @ZodResponse({ type: MessageResDTO })
  delete(
    @Param() params: GetByIdParamsDTO,
    @ActiveUser('userId') userId: number,
    @ActiveRolePermissions('name') roleName: string
  ) {
    return this.userService.delete({
      id: params.id,
      deletedById: userId,
      deletedByRoleName: roleName
    })
  }
}
