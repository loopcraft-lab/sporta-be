import { UnprocessableEntityException } from '@nestjs/common'

export const VenueOwnerAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'Error.VenueOwnerUserAlreadyExists',
    path: 'userId'
  }
])

export const VenueOwnerAlreadyVerifiedException = new UnprocessableEntityException([
  {
    message: 'Error.VenueOwnerAlreadyVerified',
    path: 'verified'
  }
])
