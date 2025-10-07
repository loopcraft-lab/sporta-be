import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { IsPublic } from '@/shared/decorators/auth.decorator'
import { GetByIdParamsDTO, PaginationQueryDTO } from '@/shared/dtos/request.dto'
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { createZodDto, ZodResponse } from 'nestjs-zod'
import {
  CourtListQuerySchema,
  CreateCourtBodySchema,
  GetCourtDetailResSchema,
  GetCourtsResSchema,
  UpdateCourtBodySchema
} from './court.model'
import { CourtService } from './court.service'

// Inline DTOs (kept local to stay concise)
class GetCourtsResDTO extends createZodDto(GetCourtsResSchema) {}
class GetCourtDetailResDTO extends createZodDto(GetCourtDetailResSchema) {}
class CreateCourtBodyDTO extends createZodDto(CreateCourtBodySchema) {}
class UpdateCourtBodyDTO extends createZodDto(UpdateCourtBodySchema) {}

@Controller('court')
export class CourtController {
  constructor(private readonly service: CourtService) {}

  @Get()
  @IsPublic()
  @ZodResponse({ type: GetCourtsResDTO })
  list(@Query() pagination: PaginationQueryDTO, @Query() rawQuery: any) {
    const parse = CourtListQuerySchema.safeParse(rawQuery)
    const filter = parse.success ? parse.data : undefined
    return this.service.list({ page: pagination.page, limit: pagination.limit }, filter)
  }

  @Get(':id')
  @IsPublic()
  @ZodResponse({ type: GetCourtDetailResDTO })
  detail(@Param() { id }: GetByIdParamsDTO) {
    return this.service.detail(id)
  }

  @Post()
  @IsPublic() // FIX: Cho phép OWNER tạo court
  @ZodResponse({ type: GetCourtDetailResDTO })
  create(@Body() body: CreateCourtBodyDTO, @ActiveUser('userId') userId: number) {
    return this.service.create(body as any, userId)
  }

  @Put(':id')
  @IsPublic() // FIX: Cho phép OWNER update court
  @ZodResponse({ type: GetCourtDetailResDTO })
  update(
    @Param() { id }: GetByIdParamsDTO,
    @Body() body: UpdateCourtBodyDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.service.update(id, body as any, userId)
  }

  @Delete(':id')
  @IsPublic() // FIX: Cho phép OWNER xóa court
  @ZodResponse({ type: GetCourtDetailResDTO })
  delete(@Param() { id }: GetByIdParamsDTO, @ActiveUser('userId') userId: number) {
    return this.service.delete(id, userId)
  }
}
