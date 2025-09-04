import {
  LoginBodyDTO,
  LoginResDTO,
  LogoutBodyDTO,
  RefreshTokenBodyDTO,
  RefreshTokenResDTO,
  RegisterBodyDTO,
  RegisterResDTO,
  SendOTPBodyDTO
} from '@/routes/auth/auth.dto'
import { IsPublic } from '@/shared/decorators/auth.decorator'
import { MessageResDTO } from '@/shared/dtos/response.dto'
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ZodResponse } from 'nestjs-zod'
import { AuthService } from './auth.service'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp')
  @IsPublic()
  @ZodResponse({ type: MessageResDTO })
  sendOTP(@Body() body: SendOTPBodyDTO) {
    return this.authService.sendOTP(body)
  }

  @Post('login')
  @IsPublic()
  @ZodResponse({ type: LoginResDTO })
  login(@Body() body: LoginBodyDTO) {
    return this.authService.login({
      ...body
    })
  }

  @Post('register')
  @IsPublic()
  @ZodResponse({ type: RegisterResDTO })
  register(@Body() body: RegisterBodyDTO) {
    return this.authService.register(body)
  }

  @Post('refresh-token')
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ type: RefreshTokenResDTO })
  refreshToken(@Body() body: RefreshTokenBodyDTO) {
    return this.authService.refreshToken({
      refreshToken: body.refreshToken
    })
  }

  @Post('logout')
  @ZodResponse({ type: MessageResDTO })
  @ApiBearerAuth()
  logout(@Body() body: LogoutBodyDTO) {
    return this.authService.logout(body.refreshToken)
  }
}
