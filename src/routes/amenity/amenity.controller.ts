import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { IsPublic } from '@/shared/decorators/auth.decorator'
import { GetByIdParamsDTO, PaginationQueryDTO } from '@/shared/dtos/request.dto'
import { MessageResDTO } from '@/shared/dtos/response.dto'
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ZodResponse } from 'nestjs-zod'
import {
  CreateAmenityBodyDTO,
  GetAmenitiesResDTO,
  GetAmenityDetailResDTO,
  UpdateAmenityBodyDTO
} from './amenity.dto'
import { AmenityService } from './amenity.service'

@ApiTags('Amenity')
@ApiBearerAuth()
@Controller('amenity')
export class AmenityController {
  constructor(private readonly service: AmenityService) {}

  @Get()
  @IsPublic()
  @ZodResponse({ type: GetAmenitiesResDTO })
  list(@Query() query: PaginationQueryDTO) {
    return this.service.list({ page: query.page, limit: query.limit })
  }

  @Get(':id')
  @IsPublic()
  @ZodResponse({ type: GetAmenityDetailResDTO })
  findById(@Param() params: GetByIdParamsDTO) {
    return this.service.findById(params.id)
  }

  @Post()
  @ZodResponse({ type: GetAmenityDetailResDTO })
  create(@Body() body: CreateAmenityBodyDTO, @ActiveUser('userId') userId: number) {
    return this.service.create({ data: body, createdById: userId })
  }

  @Put(':id')
  @ZodResponse({ type: GetAmenityDetailResDTO })
  update(
    @Body() body: UpdateAmenityBodyDTO,
    @Param() params: GetByIdParamsDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.service.update({ id: params.id, data: body, updatedById: userId })
  }

  @Delete(':id')
  @ZodResponse({ type: MessageResDTO })
  delete(@Param() params: GetByIdParamsDTO, @ActiveUser('userId') userId: number) {
    return this.service.delete({ id: params.id, deletedById: userId })
  }
}
