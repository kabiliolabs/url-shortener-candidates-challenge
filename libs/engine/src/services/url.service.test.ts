import { describe, expect, it, vi, beforeEach } from 'vitest'

const mockRedis = vi.hoisted(() => ({ get: vi.fn(), set: vi.fn() }))

vi.mock('../cache/redis', () => ({
  getRedis: vi.fn().mockResolvedValue(mockRedis),
}))

const mockTx = vi.hoisted(() => ({
  url: { create: vi.fn(), update: vi.fn() },
}))

vi.mock('../repository/url.repository', () => ({
  prisma: {
    $transaction: vi.fn(async (fn: (tx: unknown) => unknown) => fn(mockTx)),
  },
  findUrlByCode: vi.fn(),
  incrementClicks: vi.fn(),
}))

import { shortenUrl, findByCode } from './url.service'
import { findUrlByCode, incrementClicks } from '../repository/url.repository'

beforeEach(() => vi.clearAllMocks())

describe('shortenUrl', () => {
  it('creates a url and returns it with a base62 code', async () => {
    mockTx.url.create.mockResolvedValue({ id: 1, code: '_tmp', originalUrl: 'https://example.com', clicks: 0, createdAt: new Date() })
    mockTx.url.update.mockResolvedValue({ id: 1, code: '1', originalUrl: 'https://example.com', clicks: 0, createdAt: new Date() })

    const result = await shortenUrl('https://example.com')

    expect(mockTx.url.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { code: '1' } })
    )
    expect(result.code).toBe('1')
  })

  it('encodes higher IDs into multi-character base62 codes', async () => {
    mockTx.url.create.mockResolvedValue({ id: 62, code: '_tmp', originalUrl: 'https://example.com', clicks: 0, createdAt: new Date() })
    mockTx.url.update.mockResolvedValue({ id: 62, code: '10', originalUrl: 'https://example.com', clicks: 0, createdAt: new Date() })

    const result = await shortenUrl('https://example.com')

    expect(mockTx.url.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { code: '10' } })
    )
    expect(result.code).toBe('10')
  })
})

describe('findByCode', () => {
  it('returns cached url and fires click increment', async () => {
    const mockUrl = { id: 1, code: '1', originalUrl: 'https://example.com', clicks: 0, createdAt: new Date() }
    mockRedis.get.mockResolvedValue(JSON.stringify(mockUrl))

    const result = await findByCode('1')

    expect(findUrlByCode).not.toHaveBeenCalled()
    expect(incrementClicks).toHaveBeenCalledWith('1')
    // createdAt is serialized as string through JSON — Date fields lose their type
    expect(result).toEqual(JSON.parse(JSON.stringify(mockUrl)))
  })

  it('fetches from db on cache miss, stores in cache and fires click increment', async () => {
    const mockUrl = { id: 1, code: '1', originalUrl: 'https://example.com', clicks: 0, createdAt: new Date() }
    mockRedis.get.mockResolvedValue(null)
    vi.mocked(findUrlByCode).mockResolvedValue(mockUrl)

    const result = await findByCode('1')

    expect(findUrlByCode).toHaveBeenCalledWith('1')
    expect(mockRedis.set).toHaveBeenCalledWith('url:1', JSON.stringify(mockUrl), { EX: 3600 })
    expect(incrementClicks).toHaveBeenCalledWith('1')
    expect(result).toEqual(mockUrl)
  })

  it('returns null and does not increment clicks when not found', async () => {
    mockRedis.get.mockResolvedValue(null)
    vi.mocked(findUrlByCode).mockResolvedValue(null)

    const result = await findByCode('notexist')

    expect(incrementClicks).not.toHaveBeenCalled()
    expect(result).toBeNull()
  })
})
