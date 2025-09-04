import envConfig from '@/config/env.config'
import Client from 'ioredis'
import Redlock from 'redlock'

export const redis = new Client(envConfig.REDIS_URL)
export const redlock = new Redlock([redis as any], {
  retryCount: 3,
  retryDelay: 200 // time in ms
})
