import { UnprocessableEntityException } from '@nestjs/common'

export const SportProfileAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'Error.SportProfileAlreadyExists',
    path: 'path'
  },
  {
    message: 'Error.SportProfileAlreadyExists',
    path: 'method'
  }
])
