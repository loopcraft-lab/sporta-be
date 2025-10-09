import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { IsPublic, SkipPermissionCheck } from '@/shared/decorators/auth.decorator'
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
import { VenueOwnerListQuerySchema } from './venue-owner.model'
import { VenueOwnerService } from './venue-owner.service'

@ApiTags('VenueOwner')
@ApiBearerAuth()
@Controller('venue-owner')
export class VenueOwnerController {
  constructor(private readonly venueOwnerService: VenueOwnerService) {}

  @Get()
  @IsPublic()
  @ZodResponse({ type: GetVenueOwnersResDTO })
  list(@Query() pagination: PaginationQueryDTO, @Query() rawQuery: any) {
    const parseResult = VenueOwnerListQuerySchema.safeParse(rawQuery)
    const filter = parseResult.success ? parseResult.data : undefined

    return this.venueOwnerService.list(
      { page: pagination.page, limit: pagination.limit },
      filter
    )
  }

  @Get('me')
  @SkipPermissionCheck() // Allow any authenticated user to get their venue owner info
  @ZodResponse({ type: GetVenueOwnerDetailResDTO })
  getMyVenueOwner(@ActiveUser('userId') userId: number) {
    return this.venueOwnerService.findByUserId(userId)
  }

  @Get(':id')
  @IsPublic()
  @ZodResponse({ type: GetVenueOwnerDetailResDTO })
  findById(@Param() params: GetByIdParamsDTO) {
    return this.venueOwnerService.findById(params.id)
  }

  @Post()
  @SkipPermissionCheck() // Allow any authenticated user to register as venue owner
  @ZodResponse({ type: GetVenueOwnerDetailResDTO })
  create(@Body() body: CreateVenueOwnerBodyDTO, @ActiveUser('userId') userId: number) {
    return this.venueOwnerService.create({ data: body, createdById: userId })
  }

  @Put(':id')
  @SkipPermissionCheck() // Allow owner to update their own info
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
  @SkipPermissionCheck() // TEMPORARY FIX: Skip permission check, nhưng vẫn require authentication
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
