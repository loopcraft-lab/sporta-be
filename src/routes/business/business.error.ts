import { UnprocessableEntityException } from '@nestjs/common'

export const BusinessAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'Error.BusinessAlreadyExists',
    path: 'path'
  },
  {
    message: 'Error.BusinessAlreadyExists',
    path: 'method'
  }
])
