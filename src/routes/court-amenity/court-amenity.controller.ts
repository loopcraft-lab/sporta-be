import { IsPublic } from '@/shared/decorators/auth.decorator'
import { MessageResDTO } from '@/shared/dtos/response.dto'
import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ZodResponse } from 'nestjs-zod'
import {
  AttachCourtAmenityBodyDTO,
  BulkSetCourtAmenitiesBodyDTO,
  DetachCourtAmenityBodyDTO,
  GetCourtAmenitiesResDTO
} from './court-amenity.dto'
import { CourtAmenityService } from './court-amenity.service'

@ApiTags('CourtAmenity')
@ApiBearerAuth()
@Controller('court-amenity')
export class CourtAmenityController {
  constructor(private readonly service: CourtAmenityService) {}

  @Get('court/:courtId')
  @IsPublic()
  @ZodResponse({ type: GetCourtAmenitiesResDTO })
  list(@Param('courtId') courtId: string) {
    return this.service.list(Number(courtId))
  }

  @Post('attach')
  @ZodResponse({ type: MessageResDTO })
  attach(@Body() body: AttachCourtAmenityBodyDTO) {
    return this.service.attach(body)
  }

  @Delete('detach')
  @ZodResponse({ type: MessageResDTO })
  detach(@Body() body: DetachCourtAmenityBodyDTO) {
    return this.service.detach(body)
  }

  @Put('bulk-set')
  @ZodResponse({ type: MessageResDTO })
  bulkSet(@Body() body: BulkSetCourtAmenitiesBodyDTO) {
    return this.service.bulkSet(body)
  }
}
