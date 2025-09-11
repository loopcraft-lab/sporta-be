import { NotFoundException, UnprocessableEntityException } from '@nestjs/common'

// Province Errors
export const ProvinceNotFoundException = new NotFoundException([
  {
    message: 'Error.ProvinceNotFound',
    path: 'id'
  }
])

export const ProvinceAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'Error.ProvinceAlreadyExists',
    path: 'name'
  },
  {
    message: 'Error.ProvinceCodeAlreadyExists',
    path: 'code'
  }
])

// District Errors
export const DistrictNotFoundException = new NotFoundException([
  {
    message: 'Error.DistrictNotFound',
    path: 'id'
  }
])

export const DistrictAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'Error.DistrictAlreadyExists',
    path: 'name'
  },
  {
    message: 'Error.DistrictCodeAlreadyExists',
    path: 'code'
  }
])

// Ward Errors
export const WardNotFoundException = new NotFoundException([
  {
    message: 'Error.WardNotFound',
    path: 'id'
  }
])

export const WardAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'Error.WardAlreadyExists',
    path: 'name'
  },
  {
    message: 'Error.WardCodeAlreadyExists',
    path: 'code'
  }
])

// Search Errors
export const LocationSearchInvalidQueryException = new UnprocessableEntityException([
  {
    message: 'Error.LocationSearchInvalidQuery',
    path: 'q'
  }
])

export const LocationBulkImportFailedException = new UnprocessableEntityException([
  {
    message: 'Error.LocationBulkImportFailed',
    path: 'data'
  }
])
