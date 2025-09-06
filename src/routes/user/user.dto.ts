import {
  CreateUserBodySchema,
  GetUsersResSchema,
  UpdateUserBodySchema
} from '@/routes/user/user.model'
import { createZodDto } from 'nestjs-zod'
import { UpdateProfileResDTO } from 'src/shared/dtos/shared-user.dto'

export class GetUsersResDTO extends createZodDto(GetUsersResSchema) {}

export class CreateUserBodyDTO extends createZodDto(CreateUserBodySchema) {}

export class UpdateUserBodyDTO extends createZodDto(UpdateUserBodySchema) {}

export class CreateUserResDTO extends UpdateProfileResDTO {}
