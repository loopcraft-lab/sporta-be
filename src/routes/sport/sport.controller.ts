import {
  CreateSportBodyDTO,
  GetSportDetailResDTO,
  GetSportsResDTO,
  UpdateSportBodyDTO
} from '@/routes/sport/sport.dto'
import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { IsPublic } from '@/shared/decorators/auth.decorator'
import { GetByIdParamsDTO, PaginationQueryDTO } from '@/shared/dtos/request.dto'
import { MessageResDTO } from '@/shared/dtos/response.dto'
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ZodResponse } from 'nestjs-zod'
import { SportService } from './sport.service'

@ApiTags('Sport')
@ApiBearerAuth()
@Controller('sport')
export class SportController {
  constructor(private readonly sportService: SportService) {}

  @Get()
  @IsPublic()
  @ZodResponse({ type: GetSportsResDTO })
  list(@Query() query: PaginationQueryDTO) {
    return this.sportService.list({
      page: query.page,
      limit: query.limit
    })
  }

  @Get(':id')
  @IsPublic()
  @ZodResponse({ type: GetSportDetailResDTO })
  findById(@Param() params: GetByIdParamsDTO) {
    return this.sportService.findById(params.id)
  }

  @Post()
  @ZodResponse({ type: GetSportDetailResDTO })
  create(@Body() body: CreateSportBodyDTO, @ActiveUser('userId') userId: number) {
    return this.sportService.create({
      data: body,
      createdById: userId
    })
  }

  @Put(':id')
  @ZodResponse({ type: GetSportDetailResDTO })
  update(
    @Body() body: UpdateSportBodyDTO,
    @Param() params: GetByIdParamsDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.sportService.update({
      data: body,
      id: params.id,
      updatedById: userId
    })
  }

  @Delete(':id')
  @ZodResponse({ type: MessageResDTO })
  delete(@Param() params: GetByIdParamsDTO, @ActiveUser('userId') userId: number) {
    return this.sportService.delete({
      id: params.id,
      deletedById: userId
    })
  }
}
