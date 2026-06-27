import { describe, expect, it } from 'vitest';
import { generateUniqueCode } from './code-generator.js';

const BASE62 = /^[a-zA-Z0-9]+$/;

describe('generateUniqueCode', () => {
  it('generates a 7-character code', async () => {
    const code = await generateUniqueCode();
    expect(code).toHaveLength(7);
  });

  it('uses only base62 characters', async () => {
    const code = await generateUniqueCode();
    expect(BASE62.test(code)).toBe(true);
  });

  it('generates unique codes on successive calls', async () => {
    const codes = await Promise.all(Array.from({ length: 10 }, () => generateUniqueCode()));
    const unique = new Set(codes);
    expect(unique.size).toBe(10);
  });
});
