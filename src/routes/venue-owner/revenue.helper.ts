import { PrismaService } from '@/shared/services/prisma.service'
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
  subYears
} from 'date-fns'

export interface DateRange {
  startDate: Date
  endDate: Date
}

export interface PreviousPeriod extends DateRange {
  label: string
}

/**
 * Calculate date range for revenue queries
 */
export function calculateDateRange(
  startDate?: string,
  endDate?: string,
  groupBy: 'day' | 'week' | 'month' | 'year' = 'day'
): DateRange {
  const now = new Date()

  // If both dates provided, use them
  if (startDate && endDate) {
    return {
      startDate: startOfDay(new Date(startDate)),
      endDate: endOfDay(new Date(endDate))
    }
  }

  // Default ranges based on groupBy
  switch (groupBy) {
    case 'day':
      // Last 30 days
      return {
        startDate: startOfDay(subDays(now, 29)),
        endDate: endOfDay(now)
      }
    case 'week':
      // Last 12 weeks
      return {
        startDate: startOfWeek(subWeeks(now, 11), { weekStartsOn: 1 }),
        endDate: endOfWeek(now, { weekStartsOn: 1 })
      }
    case 'month':
      // Last 12 months
      return {
        startDate: startOfMonth(subMonths(now, 11)),
        endDate: endOfMonth(now)
      }
    case 'year':
      // Last 5 years
      return {
        startDate: startOfYear(subYears(now, 4)),
        endDate: endOfYear(now)
      }
  }
}

/**
 * Calculate previous period for comparison
 */
export function calculatePreviousPeriod(
  currentStart: Date,
  currentEnd: Date
): PreviousPeriod {
  const duration = currentEnd.getTime() - currentStart.getTime()
  const durationDays = duration / (1000 * 60 * 60 * 24)

  return {
    startDate: new Date(currentStart.getTime() - duration),
    endDate: new Date(currentStart.getTime() - 1),
    label: `${Math.round(durationDays)} days ago`
  }
}

/**
 * Calculate growth percentage
 */
export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Number((((current - previous) / previous) * 100).toFixed(2))
}

/**
 * Format date for grouping
 */
export function formatDateForGrouping(
  date: Date,
  groupBy: 'day' | 'week' | 'month' | 'year'
): string {
  switch (groupBy) {
    case 'day':
      return format(date, 'yyyy-MM-dd')
    case 'week':
      return format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd')
    case 'month':
      return format(date, 'yyyy-MM')
    case 'year':
      return format(date, 'yyyy')
  }
}

/**
 * Generate date labels for time series
 */
export function generateDateLabels(
  startDate: Date,
  endDate: Date,
  groupBy: 'day' | 'week' | 'month' | 'year'
): Array<{ date: string; label: string }> {
  const labels: Array<{ date: string; label: string }> = []
  let current = new Date(startDate)

  while (current <= endDate) {
    const dateKey = formatDateForGrouping(current, groupBy)

    let label: string
    switch (groupBy) {
      case 'day':
        label = format(current, 'dd/MM')
        break
      case 'week':
        label = `Tuần ${format(current, 'ww')}`
        break
      case 'month':
        label = format(current, 'MM/yyyy')
        break
      case 'year':
        label = format(current, 'yyyy')
        break
    }

    labels.push({ date: dateKey, label })

    // Move to next period
    switch (groupBy) {
      case 'day':
        current = addDays(current, 1)
        break
      case 'week':
        current = addWeeks(current, 1)
        break
      case 'month':
        current = addMonths(current, 1)
        break
      case 'year':
        current = addYears(current, 1)
        break
    }
  }

  return labels
}

/**
 * Get revenue summary for a period
 */
export async function getRevenueSummary(
  prisma: PrismaService,
  venueOwnerId: number,
  startDate: Date,
  endDate: Date
) {
  // Get all bookings in period
  const bookings = await prisma.booking.findMany({
    where: {
      court: { venueOwnerId },
      bookingDate: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      totalPrice: true,
      status: true,
      paymentStatus: true
    }
  })

  // FIX: Only count PAID bookings that are NOT cancelled
  const totalRevenue = bookings
    .filter((b) => b.paymentStatus === 'PAID' && b.status !== 'CANCELLED')
    .reduce((sum, b) => sum + b.totalPrice, 0)

  // FIX: Only count PENDING bookings that are NOT cancelled
  const pendingRevenue = bookings
    .filter((b) => b.paymentStatus === 'PENDING' && b.status !== 'CANCELLED')
    .reduce((sum, b) => sum + b.totalPrice, 0)

  // Count only non-cancelled bookings
  const activeBookings = bookings.filter((b) => b.status !== 'CANCELLED')
  const totalBookings = activeBookings.length

  const paidBookings = bookings.filter(
    (b) => b.paymentStatus === 'PAID' && b.status !== 'CANCELLED'
  ).length

  const pendingBookings = bookings.filter(
    (b) => b.paymentStatus === 'PENDING' && b.status !== 'CANCELLED'
  ).length

  const cancelledBookings = bookings.filter((b) => b.status === 'CANCELLED').length

  return {
    totalRevenue,
    paidRevenue: totalRevenue,
    pendingRevenue,
    totalBookings,
    paidBookings,
    pendingBookings,
    cancelledBookings,
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(endDate, 'yyyy-MM-dd')
  }
}
