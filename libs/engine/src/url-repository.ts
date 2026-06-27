import type { ShortUrl } from '@prisma/client';
import { prisma } from './db.js';
import { NotFoundError } from './errors.js';

export type { ShortUrl };

export async function createShortUrl(code: string, originalUrl: string): Promise<ShortUrl> {
  return prisma.shortUrl.create({ data: { code, originalUrl } });
}

export async function getShortUrlByCode(code: string): Promise<ShortUrl | null> {
  return prisma.shortUrl.findUnique({ where: { code } });
}

export async function recordClick(code: string): Promise<ShortUrl> {
  const existing = await prisma.shortUrl.findUnique({ where: { code } });
  if (!existing) throw new NotFoundError(code);
  return prisma.shortUrl.update({
    where: { code },
    data: { clickCount: { increment: 1 }, lastClickedAt: new Date() },
  });
}

export async function listShortUrls(): Promise<ShortUrl[]> {
  return prisma.shortUrl.findMany({ orderBy: { createdAt: 'desc' } });
}

export function buildShortUrl(code: string, baseUrl: string): string {
  return `${baseUrl}/s/${code}`;
}
