import { encode } from '../utils/base62'
import { prisma, findUrlByCode, incrementClicks } from '../repository/url.repository'

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
  const url = await findUrlByCode(code)
  // Awaiting incrementClicks adds latency to every redirect. Dropping the await would
  // make it fire-and-forget but risks losing increments if the process crashes mid-flight.
  // For higher scale: cache lookups in Redis (TTL 1h) and batch-flush click counts to
  // the DB periodically to avoid a write on every request.
  if (url) await incrementClicks(code)
  return url
}
