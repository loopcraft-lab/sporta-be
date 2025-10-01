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
  ApproveVenueOwnerBodyDTO,
  CreateVenueOwnerBodyDTO,
  GetVenueOwnerDetailResDTO,
  GetVenueOwnersResDTO,
  UpdateVenueOwnerBodyDTO
} from './venue-owner.dto'
import { VenueOwnerService } from './venue-owner.service'

@ApiTags('VenueOwner')
@ApiBearerAuth()
@Controller('venue-owner')
export class VenueOwnerController {
  constructor(private readonly venueOwnerService: VenueOwnerService) {}

  @Get()
  @IsPublic()
  @ZodResponse({ type: GetVenueOwnersResDTO })
  list(@Query() query: PaginationQueryDTO) {
    return this.venueOwnerService.list({ page: query.page, limit: query.limit })
  }

  @Get(':id')
  @IsPublic()
  @ZodResponse({ type: GetVenueOwnerDetailResDTO })
  findById(@Param() params: GetByIdParamsDTO) {
    return this.venueOwnerService.findById(params.id)
  }

  @Post()
  @ZodResponse({ type: GetVenueOwnerDetailResDTO })
  create(@Body() body: CreateVenueOwnerBodyDTO, @ActiveUser('userId') userId: number) {
    return this.venueOwnerService.create({ data: body, createdById: userId })
  }

  @Put(':id')
  @ZodResponse({ type: GetVenueOwnerDetailResDTO })
  update(
    @Body() body: UpdateVenueOwnerBodyDTO,
    @Param() params: GetByIdParamsDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.venueOwnerService.update({
      id: params.id,
      data: body,
      updatedById: userId
    })
  }

  @Patch(':id/approve')
  @ZodResponse({ type: GetVenueOwnerDetailResDTO })
  approve(
    @Body() body: ApproveVenueOwnerBodyDTO,
    @Param() params: GetByIdParamsDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.venueOwnerService.approve({ id: params.id, body, approvedById: userId })
  }

  @Delete(':id')
  @ZodResponse({ type: MessageResDTO })
  delete(@Param() params: GetByIdParamsDTO, @ActiveUser('userId') userId: number) {
    return this.venueOwnerService.delete({ id: params.id, deletedById: userId })
  }
}
