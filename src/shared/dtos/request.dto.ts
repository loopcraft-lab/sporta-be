import { createZodDto } from 'nestjs-zod'
import {
  EmptyBodySchema,
  GetByIdParamsSchema,
  PaginationQuerySchema
} from 'src/shared/models/request.model'

export class EmptyBodyDTO extends createZodDto(EmptyBodySchema) {}

export class PaginationQueryDTO extends createZodDto(PaginationQuerySchema) {}

export class GetByIdParamsDTO extends createZodDto(GetByIdParamsSchema) {}
