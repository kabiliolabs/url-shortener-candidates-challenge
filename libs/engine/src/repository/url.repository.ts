import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
export const prisma = new PrismaClient({ adapter })

export async function findUrlByCode(code: string) {
  return prisma.url.findUnique({ where: { code } })
}

export async function incrementClicks(code: string) {
  return prisma.url.update({ where: { code }, data: { clicks: { increment: 1 } } })
}
