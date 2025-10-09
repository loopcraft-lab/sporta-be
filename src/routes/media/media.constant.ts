export const MEDIA_CATEGORIES = ['avatar', 'sport', 'court', 'venue'] as const
export type MediaCategory = (typeof MEDIA_CATEGORIES)[number]

export const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif'
] as const
