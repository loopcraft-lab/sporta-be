import { UnprocessableEntityException } from '@nestjs/common'

export const SportAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'Error.SportAlreadyExists',
    path: 'path'
  },
  {
    message: 'Error.SportAlreadyExists',
    path: 'method'
  }
])
