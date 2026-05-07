import type { LinkRecord, LinkRepository } from "../repository.js"
import { RepositoryConflictError } from "../repository.js"

function makeRecord(
  code: string,
  originalUrl: string,
  overrides?: Partial<LinkRecord>,
): LinkRecord {
  return {
    id: `id-${code}`,
    code,
    originalUrl,
    clickCount: 0,
    createdAt: new Date("2025-01-01T00:00:00Z"),
    lastClickAt: null,
    ...overrides,
  }
}

/**
 * In-memory implementation of LinkRepository.
 * Used in unit tests — no database required.
 */
export function buildInMemoryRepo(): LinkRepository & {
  _store: Map<string, LinkRecord>
  clear(): void
} {
  const byCode = new Map<string, LinkRecord>()
  const byUrl = new Map<string, LinkRecord>()

  return {
    _store: byCode,
    clear() {
      byCode.clear()
      byUrl.clear()
    },

    async findByCode(code) {
      return byCode.get(code) ?? null
    },

    async findByUrl(url) {
      return byUrl.get(url) ?? null
    },

    async create(code, url) {
      if (byCode.has(code) || byUrl.has(url)) throw new RepositoryConflictError()
      const record = makeRecord(code, url)
      byCode.set(code, record)
      byUrl.set(url, record)
      return record
    },

    async trackClick(code) {
      const record = byCode.get(code)
      if (!record) return null
      record.clickCount++
      record.lastClickAt = new Date()
      return record.originalUrl
    },

    async listRecent(limit) {
      return [...byCode.values()]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limit)
    },

    async listAll() {
      return [...byCode.values()].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      )
    },
  }
}
