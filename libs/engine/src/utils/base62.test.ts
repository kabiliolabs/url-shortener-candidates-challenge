import { describe, expect, it } from 'vitest'
import { encode } from './base62'

describe('encode', () => {
  it('encodes 0 as "0"', () => {
    expect(encode(0)).toBe('0')
  })

  it('encodes values below 62 as a single character', () => {
    expect(encode(1)).toBe('1')
    expect(encode(9)).toBe('9')
    expect(encode(10)).toBe('a')
    expect(encode(35)).toBe('z')
    expect(encode(36)).toBe('A')
    expect(encode(61)).toBe('Z')
  })

  it('encodes 62 as "10"', () => {
    expect(encode(62)).toBe('10')
  })

  it('produces shorter codes than the numeric ID for large values', () => {
    const id = 1_000_000
    expect(encode(id).length).toBeLessThan(String(id).length)
  })
})
