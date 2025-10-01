import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { IsPublic } from '@/shared/decorators/auth.decorator'
import { GetByIdParamsDTO, PaginationQueryDTO } from '@/shared/dtos/request.dto'
import { MessageResDTO } from '@/shared/dtos/response.dto'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ZodResponse } from 'nestjs-zod'
import {
  CreateVenueImageBodyDTO,
  GetVenueImageDetailResDTO,
  GetVenueImagesResDTO,
  ReorderVenueImagesBodyDTO,
  UpdateVenueImageBodyDTO
} from './venue-image.dto'
import { VenueImageService } from './venue-image.service'

@ApiTags('VenueImage')
@ApiBearerAuth()
@Controller('venue-image')
export class VenueImageController {
  constructor(private readonly service: VenueImageService) {}

  @Get()
  @IsPublic()
  @ZodResponse({ type: GetVenueImagesResDTO })
  list(@Query() query: PaginationQueryDTO, @Query('courtId') courtId?: string) {
    return this.service.list(
      { page: query.page, limit: query.limit },
      courtId ? { courtId: Number(courtId) } : undefined
    )
  }

  @Get(':id')
  @IsPublic()
  @ZodResponse({ type: GetVenueImageDetailResDTO })
  findById(@Param() params: GetByIdParamsDTO) {
    return this.service.findById(params.id)
  }

  @Post()
  @ZodResponse({ type: GetVenueImageDetailResDTO })
  create(@Body() body: CreateVenueImageBodyDTO, @ActiveUser('userId') userId: number) {
    return this.service.create({ data: body, createdById: userId })
  }

  @Put(':id')
  @ZodResponse({ type: GetVenueImageDetailResDTO })
  update(
    @Body() body: UpdateVenueImageBodyDTO,
    @Param() params: GetByIdParamsDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.service.update({ id: params.id, data: body, updatedById: userId })
  }

  @Patch('reorder')
  @ZodResponse({ type: MessageResDTO })
  reorder(@Body() body: ReorderVenueImagesBodyDTO, @ActiveUser('userId') userId: number) {
    return this.service.reorder({ data: body, updatedById: userId })
  }

  @Delete(':id')
  @ZodResponse({ type: MessageResDTO })
  delete(@Param() params: GetByIdParamsDTO, @ActiveUser('userId') userId: number) {
    return this.service.delete({ id: params.id, deletedById: userId })
  }
}
