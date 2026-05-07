import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('../repository/url.repository', () => ({
  prisma: {
    $transaction: vi.fn(async (fn: (tx: unknown) => unknown) => fn(mockTx)),
  },
  findUrlByCode: vi.fn(),
  incrementClicks: vi.fn(),
}))

const mockTx = {
  url: {
    create: vi.fn(),
    update: vi.fn(),
  },
}

import { shortenUrl, findByCode } from './url.service'
import { findUrlByCode, incrementClicks } from '../repository/url.repository'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('shortenUrl', () => {
  it('creates a url and returns it with a base62 code', async () => {
    mockTx.url.create.mockResolvedValue({ id: 1, code: '_tmp', originalUrl: 'https://example.com', clicks: 0, createdAt: new Date() })
    mockTx.url.update.mockResolvedValue({ id: 1, code: '1', originalUrl: 'https://example.com', clicks: 0, createdAt: new Date() })

    const result = await shortenUrl('https://example.com')

    expect(mockTx.url.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ originalUrl: 'https://example.com' }) })
    )
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
  it('returns the url and increments clicks when found', async () => {
    const mockUrl = { id: 1, code: '1', originalUrl: 'https://example.com', clicks: 0, createdAt: new Date() }
    vi.mocked(findUrlByCode).mockResolvedValue(mockUrl)
    vi.mocked(incrementClicks).mockResolvedValue({ ...mockUrl, clicks: 1 })

    const result = await findByCode('1')

    expect(incrementClicks).toHaveBeenCalledWith('1')
    expect(result).toEqual(mockUrl)
  })

  it('returns null and does not increment clicks when not found', async () => {
    vi.mocked(findUrlByCode).mockResolvedValue(null)

    const result = await findByCode('notexist')

    expect(incrementClicks).not.toHaveBeenCalled()
    expect(result).toBeNull()
  })
})
