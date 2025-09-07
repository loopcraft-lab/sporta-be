import {
  CreateBusinessBodyDTO,
  GetBusinessDetailResDTO,
  GetBusinessesResDTO,
  UpdateBusinessBodyDTO
} from '@/routes/business/business.dto'
import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { GetByIdParamsDTO, PaginationQueryDTO } from '@/shared/dtos/request.dto'
import { MessageResDTO } from '@/shared/dtos/response.dto'
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ZodResponse } from 'nestjs-zod'
import { BusinessService } from './business.service'

@ApiTags('Business')
@ApiBearerAuth()
@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get()
  @ZodResponse({ type: GetBusinessesResDTO })
  list(@Query() query: PaginationQueryDTO) {
    return this.businessService.list({
      page: query.page,
      limit: query.limit
    })
  }

  @Get('id')
  @ZodResponse({ type: GetBusinessDetailResDTO })
  findById(@Param() params: GetByIdParamsDTO) {
    return this.businessService.findById(params.id)
  }

  @Post()
  @ZodResponse({ type: GetBusinessDetailResDTO })
  create(@Body() body: CreateBusinessBodyDTO, @ActiveUser('userId') userId: number) {
    return this.businessService.create({
      data: body,
      createdById: userId
    })
  }

  @Put('id')
  @ZodResponse({ type: GetBusinessDetailResDTO })
  update(
    @Body() body: UpdateBusinessBodyDTO,
    @Param() params: GetByIdParamsDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.businessService.update({
      data: body,
      id: params.id,
      updatedById: userId
    })
  }

  @Delete('id')
  @ZodResponse({ type: MessageResDTO })
  delete(@Param() params: GetByIdParamsDTO, @ActiveUser('userId') userId: number) {
    return this.businessService.delete({
      id: params.id,
      deletedById: userId
    })
  }
}
