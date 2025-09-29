import {
  Controller,
  Delete,
  Param,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common'
import { AnyFilesInterceptor } from '@nestjs/platform-express'
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiParam,
  ApiTags
} from '@nestjs/swagger'
import { Request } from 'express'
import { MEDIA_CATEGORIES } from './media.constant'
import { DeleteMediaResDTO, UploadMediasResDTO } from './media.dto'
import {
  InvalidMediaCategoryException,
  MediaNoFileUploadedException
} from './media.error'
import { MediaService } from './media.service'

@ApiBearerAuth()
@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload/:category')
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'category', enum: MEDIA_CATEGORIES })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary'
          }
        }
      }
    }
  })
  @ApiOkResponse({ type: UploadMediasResDTO })
  @UseInterceptors(AnyFilesInterceptor())
  uploadFiles(
    @Param('category') category: string,
    @UploadedFiles()
    files: Array<{
      originalname: string
      mimetype: string
      size: number
      buffer: Buffer
    }>,
    @Req() req: Request
  ) {
    if (!MEDIA_CATEGORIES.includes(category as any)) {
      throw InvalidMediaCategoryException
    }
    if (!files || files.length === 0) {
      throw MediaNoFileUploadedException
    }
    const baseUrl = `${req.protocol}://${req.get('host')}`
    const data = this.mediaService.storeFiles({
      files,
      category: category as any,
      baseUrl
    })
    return {
      data,
      message: 'Success.Upload'
    }
  }

  @Delete(':category/:filename')
  @ApiParam({ name: 'category', enum: MEDIA_CATEGORIES })
  @ApiParam({ name: 'filename', type: 'string' })
  @ApiOkResponse({ type: DeleteMediaResDTO })
  deleteFile(@Param('category') category: string, @Param('filename') filename: string) {
    if (!MEDIA_CATEGORIES.includes(category as any)) {
      throw InvalidMediaCategoryException
    }
    this.mediaService.deleteFile(category as any, filename)
    return {
      data: { filename },
      message: 'Success.Delete'
    }
  }
}
