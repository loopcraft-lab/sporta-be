import { Injectable } from '@nestjs/common'
import fs from 'fs'
import path from 'path'
import { v4 as uuid } from 'uuid'
import { ALLOWED_IMAGE_MIMES, MEDIA_CATEGORIES, MediaCategory } from './media.constant'
import {
  InvalidMediaCategoryException,
  InvalidMediaFileTypeException,
  MediaFileNotFoundException
} from './media.error'
import { UploadedFileType } from './media.model'

@Injectable()
export class MediaService {
  private readonly uploadRoot = path.resolve('uploads')

  constructor() {
    this.ensureDir(this.uploadRoot)
  }

  validateCategory(category: string): asserts category is MediaCategory {
    if (!MEDIA_CATEGORIES.includes(category as MediaCategory)) {
      throw InvalidMediaCategoryException
    }
  }

  ensureDir(dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }

  getCategoryDir(category: MediaCategory) {
    const dir = path.join(this.uploadRoot, category)
    this.ensureDir(dir)
    return dir
  }

  storeFiles(options: {
    files: Array<{
      originalname: string
      mimetype: string
      size: number
      buffer: Buffer
    }>
    category: MediaCategory
    baseUrl: string
  }): UploadedFileType[] {
    const { files, category, baseUrl } = options
    const MAX_COUNT = 10
    const MAX_SIZE = 5 * 1024 * 1024 // 5MB
    if (files.length > MAX_COUNT) {
      throw new Error('Too many files uploaded')
    }

    const saved: UploadedFileType[] = []
    const categoryDir = this.getCategoryDir(category)
    for (const f of files) {
      if (!ALLOWED_IMAGE_MIMES.includes(f.mimetype as any)) {
        throw InvalidMediaFileTypeException
      }
      if (f.size > MAX_SIZE) {
        throw InvalidMediaFileTypeException
      }
      const ext = path.extname(f.originalname) || this.extFromMime(f.mimetype)
      const filename = `${uuid()}${ext}`
      const dest = path.join(categoryDir, filename)
      fs.writeFileSync(dest, f.buffer)
      saved.push({
        filename,
        originalName: f.originalname,
        mimeType: f.mimetype,
        size: f.size,
        url: this.buildFileUrl({ baseUrl, category, filename })
      })
    }
    return saved
  }

  deleteFile(category: MediaCategory, filename: string) {
    const filePath = path.join(this.getCategoryDir(category), filename)
    if (!fs.existsSync(filePath)) {
      throw MediaFileNotFoundException
    }
    fs.unlinkSync(filePath)
  }

  buildFileUrl({
    baseUrl,
    category,
    filename
  }: {
    baseUrl: string
    category: string
    filename: string
  }) {
    return `${baseUrl}/uploads/${category}/${filename}`
  }

  private extFromMime(mime: string) {
    switch (mime) {
      case 'image/jpeg':
        return '.jpg'
      case 'image/png':
        return '.png'
      case 'image/webp':
        return '.webp'
      case 'image/avif':
        return '.avif'
      default:
        return ''
    }
  }
}
