import z from 'zod'
import { MEDIA_CATEGORIES } from './media.constant'

// Provide tuple explicitly to satisfy z.enum without mutating readonly array
export const MediaCategoryEnum = z.enum([...MEDIA_CATEGORIES] as [string, ...string[]])

export const UploadedFileSchema = z.object({
  filename: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number(),
  url: z.string()
})

export const UploadMediasResSchema = z.object({
  data: z.array(UploadedFileSchema),
  message: z.string()
})

export const DeleteMediaResSchema = z.object({
  data: z.object({ filename: z.string() }),
  message: z.string()
})

export type UploadMediasResType = z.infer<typeof UploadMediasResSchema>
export type DeleteMediaResType = z.infer<typeof DeleteMediaResSchema>
export type UploadedFileType = z.infer<typeof UploadedFileSchema>
