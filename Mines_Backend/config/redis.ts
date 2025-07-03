import Redis from 'ioredis'
import dotenv from 'dotenv'
import { logger } from '../shared/logger'

dotenv.config()

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

const createRedisClient = () => {
  const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 5,
  })

  redis.on('connect', () => {
    logger.info('Connected to Redis')
  })

  redis.on('error', (err) => {
    logger.error('Redis error:', err)
  })

  return redis
}

export const redis = createRedisClient()
