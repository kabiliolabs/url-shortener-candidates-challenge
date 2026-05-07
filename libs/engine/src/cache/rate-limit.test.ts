import { describe, expect, it, vi, beforeEach } from 'vitest'

const mockRedis = vi.hoisted(() => ({ incr: vi.fn(), expire: vi.fn() }))

vi.mock('./redis', () => ({
  getRedis: vi.fn().mockResolvedValue(mockRedis),
}))

import { checkRateLimit } from './rate-limit'

beforeEach(() => vi.clearAllMocks())

describe('checkRateLimit', () => {
  it('allows requests under the limit', async () => {
    mockRedis.incr.mockResolvedValue(1)

    const result = await checkRateLimit('1.2.3.4')

    expect(result).toBe(true)
    expect(mockRedis.expire).toHaveBeenCalledWith('ratelimit:1.2.3.4', 60)
  })

  it('allows exactly 10 requests', async () => {
    mockRedis.incr.mockResolvedValue(10)

    expect(await checkRateLimit('1.2.3.4')).toBe(true)
  })

  it('blocks the 11th request', async () => {
    mockRedis.incr.mockResolvedValue(11)

    expect(await checkRateLimit('1.2.3.4')).toBe(false)
  })

  it('does not reset TTL after the first request', async () => {
    mockRedis.incr.mockResolvedValue(5)

    await checkRateLimit('1.2.3.4')

    expect(mockRedis.expire).not.toHaveBeenCalled()
  })
})
