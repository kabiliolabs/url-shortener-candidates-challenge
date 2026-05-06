import type { PrismaClient } from "../../generated/client/index.js"
import type { LinkRecord, LinkRepository } from "../core/repository.js"
import { RepositoryConflictError } from "../core/repository.js"

function toRecord(row: {
  id: string
  code: string
  originalUrl: string
  clickCount: number
  createdAt: Date
  lastClickAt: Date | null
}): LinkRecord {
  return {
    id: row.id,
    code: row.code,
    originalUrl: row.originalUrl,
    clickCount: row.clickCount,
    createdAt: row.createdAt,
    lastClickAt: row.lastClickAt,
  }
}

function isUniqueConstraint(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code: string }).code === "P2002"
  )
}

export function buildLinkRepository(prisma: PrismaClient): LinkRepository {
  return {
    async findByCode(code) {
      const row = await prisma.link.findUnique({ where: { code } })
      return row ? toRecord(row) : null
    },

    async findByUrl(url) {
      const row = await prisma.link.findUnique({ where: { originalUrl: url } })
      return row ? toRecord(row) : null
    },

    async create(code, url) {
      try {
        const row = await prisma.link.create({
          data: { code, originalUrl: url },
        })
        return toRecord(row)
      } catch (e) {
        if (isUniqueConstraint(e)) throw new RepositoryConflictError()
        throw e
      }
    },

    async trackClick(code) {
      const row = await prisma.link.findUnique({ where: { code } })
      if (!row) return null
      await prisma.link.update({
        where: { code },
        data: { clickCount: { increment: 1 }, lastClickAt: new Date() },
      })
      return row.originalUrl
    },

    async listRecent(limit) {
      const rows = await prisma.link.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
      })
      return rows.map(toRecord)
    },

    async listAll() {
      const rows = await prisma.link.findMany({
        orderBy: { createdAt: "desc" },
      })
      return rows.map(toRecord)
    },
  }
}
