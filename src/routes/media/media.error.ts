import { BadRequestException, NotFoundException } from '@nestjs/common'

export const InvalidMediaCategoryException = new BadRequestException(
  'Error.Media.InvalidCategory'
)
export const InvalidMediaFileTypeException = new BadRequestException(
  'Error.Media.InvalidFileType'
)
export const MediaFileTooLargeException = new BadRequestException(
  'Error.Media.FileTooLarge'
)
export const MediaFileNotFoundException = new NotFoundException(
  'Error.Media.FileNotFound'
)
export const MediaNoFileUploadedException = new BadRequestException(
  'Error.Media.NoFileUploaded'
)
