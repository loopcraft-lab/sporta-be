import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

// Create Booking
export const CreateBookingSchema = z.object({
  courtId: z.number().int().positive(),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  startTime: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM
  endTime: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM
  notes: z.string().optional()
})

export class CreateBookingBodyDTO extends createZodDto(CreateBookingSchema) {}

// Update Booking Status
export const UpdateBookingStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])
})

export class UpdateBookingStatusBodyDTO extends createZodDto(UpdateBookingStatusSchema) {}

// Query Bookings
export const GetBookingsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
  courtId: z.coerce.number().int().positive().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
})

export class GetBookingsQueryDTO extends createZodDto(GetBookingsQuerySchema) {}

// Check Availability
export const CheckAvailabilityQuerySchema = z.object({
  courtId: z.coerce.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
})

export class CheckAvailabilityQueryDTO extends createZodDto(
  CheckAvailabilityQuerySchema
) {}

// Response DTOs
export class BookingResDTO {
  id: number
  userId: number
  courtId: number
  bookingDate: string
  startTime: string
  endTime: string
  duration: number
  pricePerHour: number
  totalPrice: number
  status: string
  paymentStatus: string
  notes?: string
  court?: any
  user?: any
  payment?: any
  createdAt: Date
  updatedAt: Date
}

export class BookingListResDTO {
  data: BookingResDTO[]
  meta: {
    totalItems: number
    page: number
    limit: number
    totalPages: number
  }
}

export class TimeSlotDTO {
  startTime: string
  endTime: string
  available: boolean
  price?: number
}

export class AvailabilityResDTO {
  date: string
  courtId: number
  slots: TimeSlotDTO[]
}
