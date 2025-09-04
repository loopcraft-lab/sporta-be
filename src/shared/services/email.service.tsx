import envConfig from '@/config/env.config'
import { Injectable } from '@nestjs/common'
import OTPEmail from 'emails/otp'
import React from 'react'
import { Resend } from 'resend'

@Injectable()
export class EmailService {
  private resend: Resend

  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY)
  }

  async sendOTP(payload: { email: string; code: string }) {
    const subject = 'Mã OTP'
    return this.resend.emails.send({
      from: 'Sporta <no-reply@loopcraft.tech>',
      to: [payload.email],
      subject,
      react: <OTPEmail otpCode={payload.code} title={subject} />,
    })
  }
}
