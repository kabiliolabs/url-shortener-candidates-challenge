import { encode } from '../utils/base62'
import { prisma, findUrlByCode, incrementClicks } from '../repository/url.repository'
import { getRedis } from '../cache/redis'

const CACHE_TTL = 3600 // 1 hour

// The code is derived from the DB autoincrement ID via base62 encoding, which requires
// two operations inside a transaction: insert with a temp code to obtain the ID, then
// update with the real code. A distributed ID generator (e.g. Snowflake) would eliminate
// this DB round-trip by producing unique, sortable IDs without a central sequence.
export async function shortenUrl(originalUrl: string) {
  return prisma.$transaction(async (tx) => {
    const tempCode = `_${Date.now()}${Math.random().toString(36).slice(2)}`
    const { id } = await tx.url.create({ data: { code: tempCode, originalUrl } })
    const code = encode(id)
    return tx.url.update({ where: { id }, data: { code } })
  })
}

export async function findByCode(code: string) {
  const redis = await getRedis()
  const cached = await redis.get(`url:${code}`)
  if (cached) return JSON.parse(cached)

  const url = await findUrlByCode(code)
  if (url) {
    await redis.set(`url:${code}`, JSON.stringify(url), { EX: CACHE_TTL })
    // Awaiting incrementClicks adds latency to every redirect. Dropping the await would
    // make it fire-and-forget but risks losing increments if the process crashes mid-flight.
    // For higher scale: batch-flush click counts to the DB periodically.
    await incrementClicks(code)
  }
  return url
}
