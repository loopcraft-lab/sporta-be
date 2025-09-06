import envConfig from '@/config/env.config'
import {
  DisableTwoFactorBodyDTO,
  ForgotPasswordBodyDTO,
  GetAuthorizationUrlResDTO,
  LoginBodyDTO,
  LoginResDTO,
  LogoutBodyDTO,
  RefreshTokenBodyDTO,
  RegisterBodyDTO,
  SendOTPBodyDTO,
  TwoFactorSetupResDTO
} from '@/routes/auth/auth.dto'
import { GoogleService } from '@/routes/auth/google.service'
import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { IsPublic } from '@/shared/decorators/auth.decorator'
import { EmptyBodyDTO } from '@/shared/dtos/request.dto'
import { MessageResDTO } from '@/shared/dtos/response.dto'
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { ZodResponse } from 'nestjs-zod'
import { AuthService } from './auth.service'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleService: GoogleService
  ) {}

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
  @ZodResponse({ type: MessageResDTO })
  register(@Body() body: RegisterBodyDTO) {
    return this.authService.register(body)
  }

  @Post('refresh-token')
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ type: LoginResDTO })
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

  //google
  @Get('google-link')
  @IsPublic()
  @ZodResponse({ type: GetAuthorizationUrlResDTO })
  getAuthorizationUrl() {
    return this.googleService.getAuthorizationUrl()
  }

  @Get('google/callback')
  @IsPublic()
  async googleCallback(@Query('code') code: string, @Res() res: Response) {
    try {
      const data = await this.googleService.googleCallback({
        code
      })
      return res.redirect(
        `${envConfig.GOOGLE_CLIENT_REDIRECT_URI}?accessToken=${data.accessToken}&refreshToken=${data.refreshToken}`
      )
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Đã xảy ra lỗi khi đăng nhập bằng Google, vui lòng thử lại bằng cách khác'
      return res.redirect(
        `${envConfig.GOOGLE_CLIENT_REDIRECT_URI}?errorMessage=${message}`
      )
    }
  }

  @Post('forgot-password')
  @IsPublic()
  @ZodResponse({ type: MessageResDTO })
  forgotPassword(@Body() body: ForgotPasswordBodyDTO) {
    return this.authService.forgotPassword(body)
  }

  //2fa
  @Post('2fa/setup')
  @ZodResponse({ type: TwoFactorSetupResDTO })
  setupTwoFactorAuth(@Body() _: EmptyBodyDTO, @ActiveUser('userId') userId: number) {
    return this.authService.setupTwoFactorAuth(userId)
  }

  @Post('2fa/disable')
  @ZodResponse({ type: MessageResDTO })
  disableTwoFactorAuth(
    @Body() body: DisableTwoFactorBodyDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.authService.disableTwoFactorAuth({
      ...body,
      userId
    })
  }
}
