import envConfig from '@/config/env.config'
import {
  EmailAlreadyExistsException,
  EmailNotFoundException,
  FailedToSendOTPException,
  InvalidOTPException,
  OTPExpiredException,
  RefreshTokenAlreadyUsedException
} from '@/routes/auth/auth.error'
import {
  ForgotPasswordBodyType,
  LoginBodyType,
  RefreshTokenBodyType,
  RegisterBodyType,
  SendOTPBodyType
} from '@/routes/auth/auth.model'
import { AuthRepository } from '@/routes/auth/auth.repository'
import {
  TypeOfVerificationCode,
  TypeOfVerificationCodeType
} from '@/shared/constants/auth.constant'
import { InvalidPasswordException } from '@/shared/error'
import {
  generateOTP,
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError
} from '@/shared/helper'
import { AUTH_MESSAGE } from '@/shared/messages/auth.message'
import { SharedRoleRepository } from '@/shared/repositories/shared-role.repository'
import { SharedUserRepository } from '@/shared/repositories/shared-user.repository'
import { EmailService } from '@/shared/services/email.service'
import { HashingService } from '@/shared/services/hashing.service'
import { TokenService } from '@/shared/services/token.service'
import { AccessTokenPayloadCreate } from '@/shared/types/jwt.type'
import { HttpException, Injectable } from '@nestjs/common'
import { addMilliseconds } from 'date-fns'
import ms from 'ms'
import { UnauthorizedAccessException } from './auth.error'

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly emailService: EmailService,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly sharedRoleRepository: SharedRoleRepository,
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

  //login
  async login(body: LoginBodyType) {
    const user = await this.authRepository.findUniqueUserIncludeRole({
      email: body.email
    })
    if (!user) {
      throw EmailNotFoundException
    }

    const isPasswordMatch = await this.hashingService.compare(
      body.password,
      user.password
    )
    if (!isPasswordMatch) {
      throw InvalidPasswordException
    }
    // 2. Nếu user đã bật mã 2FA thì kiểm tra mã 2FA TOTP Code hoặc OTP Code (email)
    // if (user.totpSecret) {
    //   // Nếu không có mã TOTP Code và Code thì thông báo cho client biết
    //   if (!body.totpCode && !body.code) {
    //     throw InvalidTOTPAndCodeException
    //   }

    //   // Kiểm tra TOTP Code có hợp lệ hay không
    //   if (body.totpCode) {
    //     const isValid = this.twoFactorService.verifyTOTP({
    //       email: user.email,
    //       secret: user.totpSecret,
    //       token: body.totpCode
    //     })
    //     if (!isValid) {
    //       throw InvalidTOTPException
    //     }
    //   } else if (body.code) {
    //     // Kiểm tra mã OTP có hợp lệ không
    //     await this.validateVerificationCode({
    //       email: user.email,
    //       type: TypeOfVerificationCode.LOGIN,
    //       code: body.code
    //     })
    //   }
    // }

    const tokens = await this.generateTokens({
      userId: user.id,
      roleId: user.roleId,
      roleName: user.role.name
    })
    return {
      data: tokens,
      message: AUTH_MESSAGE.LOGIN_SUCCESS
    }
  }

  //register:
  async register(body: RegisterBodyType) {
    try {
      let roleId: number
      await this.validateVerificationCode({
        email: body.email,
        type: TypeOfVerificationCode.REGISTER,
        code: body.code
      })
      if (body.isOwner) {
        roleId = await this.sharedRoleRepository.getOwnerRoleId()
      } else {
        roleId = await this.sharedRoleRepository.getClientRoleId()
      }
      const hashedPassword = await this.hashingService.hash(body.password)
      await Promise.all([
        this.authRepository.createUser({
          email: body.email,
          name: body.name,
          phoneNumber: body.phoneNumber,
          password: hashedPassword,
          roleId
        }),
        this.authRepository.deleteVerificationCode({
          email_type: {
            email: body.email,
            type: TypeOfVerificationCode.REGISTER
          }
        })
      ])
      return {
        message: AUTH_MESSAGE.REGISTER_SUCCESS
      }
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw EmailAlreadyExistsException
      }
      throw error
    }
  }

  async refreshToken({ refreshToken }: RefreshTokenBodyType) {
    try {
      // 1. Kiểm tra refreshToken có hợp lệ không
      const { userId } = await this.tokenService.verifyRefreshToken(refreshToken)
      // 2. Kiểm tra refreshToken có tồn tại trong database không
      const refreshTokenInDb =
        await this.authRepository.findUniqueRefreshTokenIncludeUserRole({
          token: refreshToken
        })
      if (!refreshTokenInDb) {
        throw RefreshTokenAlreadyUsedException
      }
      const {
        user: {
          roleId,
          role: { name: roleName }
        }
      } = refreshTokenInDb
      // 4. Xóa refreshToken cũ
      const $deleteRefreshToken = this.authRepository.deleteRefreshToken({
        token: refreshToken
      })
      // 5. Tạo mới accessToken và refreshToken
      const $tokens = this.generateTokens({ userId, roleId, roleName })
      const [, tokens] = await Promise.all([$deleteRefreshToken, $tokens])
      return {
        data: tokens,
        message: AUTH_MESSAGE.REFRESH_TOKEN_SUCCESS
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw UnauthorizedAccessException
    }
  }

  async logout(refreshToken: string) {
    try {
      await Promise.all([
        this.tokenService.verifyRefreshToken(refreshToken),
        this.authRepository.deleteRefreshToken({
          token: refreshToken
        })
      ])
      return { message: AUTH_MESSAGE.LOGOUT_SUCCESS }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw RefreshTokenAlreadyUsedException
      }
      throw UnauthorizedAccessException
    }
  }

  async forgotPassword(body: ForgotPasswordBodyType) {
    const { email, code, newPassword } = body
    const user = await this.sharedUserRepository.findUnique({
      email
    })
    if (!user) {
      throw EmailNotFoundException
    }
    await this.validateVerificationCode({
      email,
      type: TypeOfVerificationCode.FORGOT_PASSWORD,
      code
    })
    const hashedPassword = await this.hashingService.hash(newPassword)
    await Promise.all([
      this.sharedUserRepository.update(
        { id: user.id },
        {
          password: hashedPassword,
          updatedById: user.id
        }
      ),
      this.authRepository.deleteVerificationCode({
        email_type: {
          email: body.email,
          type: TypeOfVerificationCode.FORGOT_PASSWORD
        }
      })
    ])
    return {
      message: AUTH_MESSAGE.FORGOT_PASSWORD_SUCCESS
    }
  }

  //....
  async generateTokens({ userId, roleId, roleName }: AccessTokenPayloadCreate) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({
        userId,
        roleId,
        roleName
      }),
      this.tokenService.signRefreshToken({
        userId
      })
    ])
    const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)
    await this.authRepository.createRefreshToken({
      token: refreshToken,
      userId,
      expiresAt: new Date(decodedRefreshToken.exp * 1000)
    })
    return { accessToken, refreshToken }
  }
}
