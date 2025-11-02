import envConfig from '@/config/env.config'
import { TypeOfVerificationCodeType } from '@/shared/constants/auth.constant'
import { HashingService } from '@/shared/services/hashing.service'
import { RedisService } from '@/shared/services/redis.service'
import { BadRequestException, Injectable } from '@nestjs/common'
import ms from 'ms'

@Injectable()
export class OtpService {
  private defaultTtlMs = ms(envConfig.OTP_EXPIRES_IN) as number
  private maxAttempts = 5
  private attemptsTtlSec = 10 * 60 // 10 minutes window for attempts

  constructor(
    private readonly redis: RedisService,
    private readonly hashing: HashingService
  ) {}

  private key(purpose: TypeOfVerificationCodeType, identifier: string) {
    // identifier can be email, phone, or userId depending on context
    // Using enum value directly keeps naming consistent with domain
    return `otp:${purpose}:${identifier}`
  }

  private attemptsKey(purpose: TypeOfVerificationCodeType, identifier: string) {
    return `otp:attempts:${purpose}:${identifier}`
  }

  async issue({
    purpose,
    identifier,
    code,
    ttlMs
  }: {
    purpose: TypeOfVerificationCodeType
    identifier: string
    code: string
    ttlMs?: number
  }): Promise<void> {
    const hashed = await this.hashing.hash(code)
    const key = this.key(purpose, identifier)
    await this.redis.set(key, hashed, ttlMs ?? this.defaultTtlMs)
    // reset attempts on new code
    await this.redis.del(this.attemptsKey(purpose, identifier))
  }

  async invalidate(
    purpose: TypeOfVerificationCodeType,
    identifier: string
  ): Promise<void> {
    await this.redis.del(this.key(purpose, identifier))
  }

  async verify({
    purpose,
    identifier,
    code,
    consume = true
  }: {
    purpose: TypeOfVerificationCodeType
    identifier: string
    code: string
    consume?: boolean
  }): Promise<boolean> {
    // throttle attempts
    const attemptsKey = this.attemptsKey(purpose, identifier)
    const attempts = await this.redis.incr(attemptsKey)
    if (attempts === 1) {
      // set TTL only on first increment
      await this.redis.expire(attemptsKey, this.attemptsTtlSec)
    }
    if (attempts > this.maxAttempts) {
      throw new BadRequestException('Too many attempts, try later')
    }

    const key = this.key(purpose, identifier)
    if (!consume) {
      const stored = await this.redis.get(key)
      if (!stored) return false
      const ok = await this.hashing.compare(code, stored)
      if (ok) await this.redis.del(attemptsKey)
      return ok
    }

    // Consume = true: enforce single-use with optimistic transaction (WATCH/MULTI)
    const client = this.redis.raw
    await client.watch(key)
    try {
      const stored = await client.get(key)
      if (!stored) {
        await client.unwatch()
        return false
      }
      const ok = await this.hashing.compare(code, stored)
      if (!ok) {
        await client.unwatch()
        return false
      }
      const tx = client.multi()
      tx.del(key)
      const res = await tx.exec()
      // If res is null, the key changed concurrently; treat as failure/consumed
      if (res === null) return false
      await this.redis.del(attemptsKey)
      return true
    } finally {
      try {
        await client.unwatch()
      } catch {
        console.log('Failed to unwatch Redis key')
      }
    }
  }
}
