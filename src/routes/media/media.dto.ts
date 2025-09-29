import { createZodDto } from 'nestjs-zod'
import { DeleteMediaResSchema, UploadMediasResSchema } from './media.model'

export class UploadMediasResDTO extends createZodDto(UploadMediasResSchema) {}
export class DeleteMediaResDTO extends createZodDto(DeleteMediaResSchema) {}
