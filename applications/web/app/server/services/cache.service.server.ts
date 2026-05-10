import { redis } from "@url-shortener/database";
import { logger } from "../lib/logger.server";

export const CACHE_PREFIX = "url:shortcode:";
export const CACHE_TTL = 600; // 10 minutes in seconds

export async function getCachedUrl(code: string): Promise<string | null> {
  try {
    return await redis.get(`${CACHE_PREFIX}${code}`);
  } catch (error) {
    logger.error({ error, code }, "Redis cache read failed, falling back to DB");
    return null;
  }
}

export async function setCachedUrl(
  code: string,
  originalUrl: string,
): Promise<void> {
  try {
    await redis.set(`${CACHE_PREFIX}${code}`, originalUrl, "EX", CACHE_TTL);
  } catch (error) {
    logger.error({ error, code }, "Redis cache write failed");
  }
}

export async function invalidateCachedUrl(code: string): Promise<void> {
  try {
    await redis.del(`${CACHE_PREFIX}${code}`);
  } catch (error) {
    logger.error({ error, code }, "Redis cache invalidation failed");
  }
}
