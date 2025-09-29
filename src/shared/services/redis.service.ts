import { redis as sharedRedis } from '@/config/redis.config'
import { Injectable, OnModuleDestroy } from '@nestjs/common'
import type { Redis as RedisClient } from 'ioredis'

// Lightweight Redis wrapper to centralize connection and common ops
@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: RedisClient

  constructor() {
    // Reuse the shared client from config to avoid duplicate connections
    this.client = sharedRedis as unknown as RedisClient
  }

  get raw() {
    return this.client
  }

  async onModuleDestroy() {
    // Graceful shutdown
    // No-op here because we don't own the shared connection lifecycle
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key)
  }

  async set(key: string, value: string, ttlMs?: number): Promise<'OK' | null> {
    if (ttlMs && ttlMs > 0) {
      return this.client.set(key, value, 'PX', ttlMs)
    }
    return this.client.set(key, value)
  }

  async getdel(key: string): Promise<string | null> {
    // Prefer GETDEL (Redis >= 6.2). Use raw CALL to avoid typing issues; fallback to GET+DEL
    try {
      const res = (await this.client.call('GETDEL', key)) as string | null
      return res
    } catch {
      const val = await this.client.get(key)
      if (val !== null) await this.client.del(key)
      return val
    }
  }

  async del(key: string): Promise<number> {
    return this.client.del(key)
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key)
  }

  async pttl(key: string): Promise<number> {
    return this.client.pttl(key)
  }

  async expire(key: string, ttlSeconds: number): Promise<number> {
    return this.client.expire(key, ttlSeconds)
  }
}
