import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { prisma } from './db.js';
import { NotFoundError } from './errors.js';
import {
  createShortUrl,
  getShortUrlByCode,
  listShortUrls,
  recordClick,
} from './url-repository.js';

beforeEach(async () => {
  await prisma.shortUrl.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('createShortUrl', () => {
  it('creates and returns a short URL', async () => {
    const url = await createShortUrl('abc1234', 'https://example.com');
    expect(url.code).toBe('abc1234');
    expect(url.originalUrl).toBe('https://example.com');
    expect(url.clickCount).toBe(0);
  });
});

describe('getShortUrlByCode', () => {
  it('returns the URL for a known code', async () => {
    await createShortUrl('abc1234', 'https://example.com');
    const found = await getShortUrlByCode('abc1234');
    expect(found?.code).toBe('abc1234');
  });

  it('returns null for an unknown code', async () => {
    const found = await getShortUrlByCode('unknown');
    expect(found).toBeNull();
  });
});

describe('recordClick', () => {
  it('increments clickCount and sets lastClickedAt', async () => {
    await createShortUrl('abc1234', 'https://example.com');
    const updated = await recordClick('abc1234');
    expect(updated.clickCount).toBe(1);
    expect(updated.lastClickedAt).not.toBeNull();
  });

  it('throws NotFoundError for unknown code', async () => {
    await expect(recordClick('unknown')).rejects.toThrow(NotFoundError);
  });
});

describe('listShortUrls', () => {
  it('returns URLs ordered newest first', async () => {
    await createShortUrl('first11', 'https://first.com');
    await createShortUrl('second2', 'https://second.com');
    const urls = await listShortUrls();
    expect(urls[0].code).toBe('second2');
    expect(urls[1].code).toBe('first11');
  });
});
