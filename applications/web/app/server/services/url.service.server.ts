import type { UrlRepository, UrlWithStats } from "../repositories/url.repository";
import type { ClickRepository, DailyClickCount, DailyClickCountByUrl } from "../repositories/click.repository";
import { generateShortCode } from "./shortcode.service.server";
import { logger } from "../lib/logger.server";

function isUniqueConstraintViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2002"
  );
}

export function validateUrl(url: string): string | null {
  if (!url || url.trim().length === 0) return "URL is required";
  if (url.length > 2048) return "URL must be 2048 characters or fewer";
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "URL must use http or https protocol";
    }
  } catch {
    return "Invalid URL format";
  }
  return null;
}

export async function shortenUrl(
  originalUrl: string,
  urlRepo: UrlRepository,
  maxRetries = 3
): Promise<{ id: number; shortCode: string; originalUrl: string; createdAt: Date }> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const shortCode = generateShortCode();
    try {
      return await urlRepo.create({ shortCode, originalUrl });
    } catch (error) {
      if (isUniqueConstraintViolation(error) && attempt < maxRetries - 1) {
        logger.warn({ attempt, shortCode }, "Short code collision, retrying");
        continue;
      }
      throw error;
    }
  }
  throw new Error("Failed to generate unique short code after max retries");
}

export async function resolveShortCode(
  code: string,
  urlRepo: UrlRepository
): Promise<{ id: number; shortCode: string; originalUrl: string; createdAt: Date } | null> {
  return urlRepo.findByCode(code);
}

export async function listUrls(
  urlRepo: UrlRepository,
  options?: { take?: number; skip?: number }
): Promise<UrlWithStats[]> {
  return urlRepo.findAllWithStats(options);
}

export async function getUrlClicksByDay(
  urlId: number,
  clickRepo: ClickRepository,
  days = 7
): Promise<DailyClickCount[]> {
  return clickRepo.getClicksByDay(urlId, days);
}

export async function getUrlClicksByDayBatch(
  urlIds: number[],
  clickRepo: ClickRepository,
  days = 7
): Promise<Map<number, DailyClickCount[]>> {
  const results = await clickRepo.getClicksByDayForUrls(urlIds, days);
  const map = new Map<number, DailyClickCount[]>();

  for (const r of results) {
    if (!map.has(r.urlId)) {
      map.set(r.urlId, []);
    }
    map.get(r.urlId)!.push({ date: r.date, count: r.count });
  }

  return map;
}
