import envConfig from '@/config/env.config'
import {
  EmailAlreadyExistsException,
  EmailNotFoundException,
  FailedToSendOTPException,
  InvalidOTPException,
  OTPExpiredException
} from '@/routes/auth/auth.error'
import { SendOTPBodyType } from '@/routes/auth/auth.model'
import { AuthRepository } from '@/routes/auth/auth.repository'
import {
  TypeOfVerificationCode,
  TypeOfVerificationCodeType
} from '@/shared/constants/auth.constant'
import { generateOTP } from '@/shared/helper'
import { AUTH_MESSAGE } from '@/shared/messages/auth.message'
import { SharedUserRepository } from '@/shared/repositories/shared-user.repository'
import { EmailService } from '@/shared/services/email.service'
import { HashingService } from '@/shared/services/hashing.service'
import { TokenService } from '@/shared/services/token.service'
import { Injectable } from '@nestjs/common'
import { addMilliseconds } from 'date-fns'
import ms from 'ms'

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly emailService: EmailService,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService
  ) {}

  async validateVerificationCode({
    email,
    type,
    code
  }: {
    email: string
    type: TypeOfVerificationCodeType
    code: string
  }) {
    const verificationCode = await this.authRepository.findUniqueVerificationCode({
      email_type: {
        email,
        type
      }
    })
    if (!verificationCode || verificationCode.code !== code) {
      throw InvalidOTPException
    }
    if (new Date(verificationCode.expiresAt) < new Date()) {
      throw OTPExpiredException
    }
    return verificationCode
  }

  async sendOTP(body: SendOTPBodyType) {
    const user = await this.sharedUserRepository.findUnique({
      email: body.email
    })
    if (body.type === TypeOfVerificationCode.REGISTER && user) {
      throw EmailAlreadyExistsException
    }
    if (body.type === TypeOfVerificationCode.FORGOT_PASSWORD && !user) {
      throw EmailNotFoundException
    }
    // 2. Tạo mã OTP
    const code = generateOTP()
    await this.authRepository.createVerificationCode({
      email: body.email,
      code,
      type: body.type,
      expiresAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN)).toISOString()
    })
    // 3. Gửi mã OTP
    const { error } = await this.emailService.sendOTP({
      email: body.email,
      code
    })
    if (error) {
      throw FailedToSendOTPException
    }
    return { message: AUTH_MESSAGE.SEND_OTP_SUCCESS }
  }
}
