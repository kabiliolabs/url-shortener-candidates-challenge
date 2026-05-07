import { getRedis } from './redis'

const WINDOW_SECONDS = 60
const MAX_REQUESTS = 10

export async function checkRateLimit(key: string): Promise<boolean> {
  const redis = await getRedis()
  const redisKey = `ratelimit:${key}`
  const count = await redis.incr(redisKey)
  if (count === 1) await redis.expire(redisKey, WINDOW_SECONDS)
  return count <= MAX_REQUESTS
}
