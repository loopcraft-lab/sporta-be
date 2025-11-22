import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { IsPublic, SkipPermissionCheck } from '@/shared/decorators/auth.decorator'
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import {
  CheckAvailabilityQueryDTO,
  CreateBookingBodyDTO,
  GetBookingsQueryDTO
} from './booking.dto'
import { BookingService } from './booking.service'

@ApiTags('Booking')
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  /**
   * Check availability for a court on a specific date
   */
  @Get('availability')
  @IsPublic()
  async checkAvailability(@Query() query: CheckAvailabilityQueryDTO) {
    const data = await this.bookingService.checkAvailability(query)
    return { data, message: 'Availability fetched successfully' }
  }

  /**
   * Create new booking
   * FIX: Allow authenticated users (CLIENT role) to book courts without permission check
   */
  @Post()
  @ApiBearerAuth()
  @SkipPermissionCheck()
  async createBooking(
    @ActiveUser('userId') userId: number,
    @Body() body: CreateBookingBodyDTO
  ) {
    return this.bookingService.createBooking(userId, body)
  }

  /**
   * Get my bookings
   * FIX: Allow authenticated users to view their own bookings
   */
  @Get('my-bookings')
  @ApiBearerAuth()
  @SkipPermissionCheck()
  async getMyBookings(
    @ActiveUser('userId') userId: number,
    @Query() query: GetBookingsQueryDTO
  ) {
    return this.bookingService.getMyBookings(userId, query)
  }

  /**
   * Check payment status by orderCode (for success page)
   * IMPORTANT: Must be BEFORE /:id route to avoid routing conflict
   */
  @Get('check-payment/:orderCode')
  @IsPublic()
  async checkPaymentByOrderCode(@Param('orderCode') orderCode: string) {
    const data = await this.bookingService.checkPaymentStatusByOrderCode(orderCode)
    return { data, message: 'Payment status checked successfully' }
  }

  /**
   * Get booking by ID
   * FIX: Allow authenticated users to view their own booking details
   */
  @Get(':id')
  @ApiBearerAuth()
  @SkipPermissionCheck()
  async getBookingById(@ActiveUser('userId') userId: number, @Param('id') id: string) {
    return this.bookingService.getBookingById(userId, Number(id))
  }

  /**
   * Check payment status and update if needed
   */
  @Post(':id/check-payment')
  @IsPublic()
  async checkPaymentStatus(@Param('id') id: string) {
    return this.bookingService.checkPaymentStatus(Number(id))
  }

  /**
   * Cancel booking
   * FIX: Allow authenticated users to cancel their own bookings
   */
  @Delete(':id')
  @ApiBearerAuth()
  @SkipPermissionCheck()
  @HttpCode(HttpStatus.OK)
  async cancelBooking(@ActiveUser('userId') userId: number, @Param('id') id: string) {
    return this.bookingService.cancelBooking(userId, Number(id))
  }

  /**
   * PayOS Webhook - Handle payment notifications
   */
  @Post('webhook/payos')
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  async handlePaymentWebhook(@Body() webhookData: any) {
    return this.bookingService.handlePaymentWebhook(webhookData)
  }
}
