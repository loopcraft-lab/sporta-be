import { SendOTPBodyDTO } from '@/routes/auth/auth.dto'
import { MessageResDTO } from '@/shared/dtos/response.dto'
import { Body, Controller, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodResponse } from 'nestjs-zod'
import { AuthService } from './auth.service'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp')
  // @IsPublic()
  @ZodResponse({ type: MessageResDTO })
  sendOTP(@Body() body: SendOTPBodyDTO) {
    return this.authService.sendOTP(body)
  }
}
