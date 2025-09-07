import {
  CreateSportProfileBodyDTO,
  GetSportProfileDetailResDTO,
  GetSportProfilesResDTO,
  UpdateSportProfileBodyDTO
} from '@/routes/sport-profile/sport-profile.dto'
import { SportProfileService } from '@/routes/sport-profile/sport-profile.service'
import { GetByIdParamsDTO, PaginationQueryDTO } from '@/shared/dtos/request.dto'
import { MessageResDTO } from '@/shared/dtos/response.dto'
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ZodResponse } from 'nestjs-zod'

@ApiTags('Sport Profile')
@ApiBearerAuth()
@Controller('sport-profile')
export class SportProfileController {
  constructor(private readonly sportProfileService: SportProfileService) {}

  @Get()
  @ZodResponse({ type: GetSportProfilesResDTO })
  list(@Query() query: PaginationQueryDTO) {
    return this.sportProfileService.list({
      page: query.page,
      limit: query.limit
    })
  }

  @Get(':id')
  @ZodResponse({ type: GetSportProfileDetailResDTO })
  findById(@Param() params: GetByIdParamsDTO) {
    return this.sportProfileService.findById(params.id)
  }

  @Post()
  @ZodResponse({ type: GetSportProfileDetailResDTO })
  create(@Body() body: CreateSportProfileBodyDTO) {
    return this.sportProfileService.create({
      data: body
    })
  }

  @Put(':id')
  @ZodResponse({ type: GetSportProfileDetailResDTO })
  update(@Body() body: UpdateSportProfileBodyDTO, @Param() params: GetByIdParamsDTO) {
    return this.sportProfileService.update({
      data: body,
      id: params.id
    })
  }

  @Delete(':id')
  @ZodResponse({ type: MessageResDTO })
  delete(@Param() params: GetByIdParamsDTO) {
    return this.sportProfileService.delete({
      id: params.id
    })
  }
}
