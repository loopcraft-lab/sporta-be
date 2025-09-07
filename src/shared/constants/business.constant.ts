export const BusinessVerificationType = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED'
} as const

export type TypeOfBusinessVerificationType =
  (typeof BusinessVerificationType)[keyof typeof BusinessVerificationType]
