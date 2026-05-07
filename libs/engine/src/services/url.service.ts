import { encode } from '../utils/base62'
import { prisma, findUrlByCode } from '../repository/url.repository'

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
  return findUrlByCode(code)
}
