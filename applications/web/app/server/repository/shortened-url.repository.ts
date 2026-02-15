/**
 * Data access layer for ShortenedUrl. Only Prisma/DB calls.
 * No validation or domain logic. Backend-only.
 */
import { db } from "../db.js";
import type { ShortenedUrlEntity, UpdateShortenedUrlInput } from "../types.js";
import { isNotFoundError } from "../utils/prisma-error.server.js";

const SELECT_ALL = {
  id: true,
  code: true,
  url: true,
  createdAt: true,
  clickCount: true,
} as const;

export async function create(data: { code: string; url: string }): Promise<ShortenedUrlEntity> {
  return db.shortenedUrl.create({
    data: { code: data.code, url: data.url },
    select: SELECT_ALL,
  });
}

export async function getUrlAndIncrementClicks(code: string): Promise<string | null> {
  const row = await db.shortenedUrl.findUnique({ where: { code }, select: { url: true } });
  if (!row) return null;
  await db.shortenedUrl.update({ where: { code }, data: { clickCount: { increment: 1 } } });
  return row.url;
}

export async function findById(id: string): Promise<ShortenedUrlEntity | null> {
  return db.shortenedUrl.findUnique({ where: { id }, select: SELECT_ALL });
}

export async function findByCode(code: string): Promise<ShortenedUrlEntity | null> {
  return db.shortenedUrl.findUnique({ where: { code }, select: SELECT_ALL });
}

/** Finds one shortened URL by long URL (for deduplication). */
export async function findFirstByUrl(url: string): Promise<ShortenedUrlEntity | null> {
  return db.shortenedUrl.findFirst({
    where: { url },
    orderBy: { createdAt: "desc" },
    select: SELECT_ALL,
  });
}

export async function updateById(
  id: string,
  data: UpdateShortenedUrlInput
): Promise<ShortenedUrlEntity | null> {
  try {
    const payload: { url?: string; code?: string } = {};
    if (data.url !== undefined) payload.url = data.url;
    if (data.code !== undefined) payload.code = data.code;
    if (Object.keys(payload).length === 0) return findById(id);
    return await db.shortenedUrl.update({ where: { id }, data: payload, select: SELECT_ALL });
  } catch (e: unknown) {
    if (isNotFoundError(e)) return null;
    throw e;
  }
}

export async function updateByCode(
  code: string,
  data: UpdateShortenedUrlInput
): Promise<ShortenedUrlEntity | null> {
  try {
    const payload: { url?: string; code?: string } = {};
    if (data.url !== undefined) payload.url = data.url;
    if (data.code !== undefined) payload.code = data.code;
    if (Object.keys(payload).length === 0) return findByCode(code);
    return await db.shortenedUrl.update({ where: { code }, data: payload, select: SELECT_ALL });
  } catch (e: unknown) {
    if (isNotFoundError(e)) return null;
    throw e;
  }
}

export async function findAll(): Promise<ShortenedUrlEntity[]> {
  return db.shortenedUrl.findMany({
    orderBy: { createdAt: "desc" },
    select: SELECT_ALL,
  });
}
