/**
 * In-memory rate limit for POST /api/shorten to reduce abuse.
 * Uses a simple sliding-window style: max N requests per key per window.
 * Key is derived from request (IP when available).
 */

import {
  RATE_LIMIT_SHORTEN_MAX,
  RATE_LIMIT_WINDOW_MS,
  SERVER_MESSAGES,
} from "../constants.js";

interface WindowEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, WindowEntry>();

function getKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "anonymous";
}

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; message: string };

/**
 * Returns { allowed: true } or { allowed: false, message }.
 * Call before processing POST /api/shorten.
 */
export function checkShortenRateLimit(request: Request): RateLimitResult {
  const key = getKey(request);
  const now = Date.now();

  let entry = store.get(key);
  if (!entry) {
    store.set(key, { count: 1, windowStart: now });
    return { allowed: true };
  }

  if (now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
    entry = { count: 1, windowStart: now };
    store.set(key, entry);
    return { allowed: true };
  }

  entry.count += 1;
  if (entry.count > RATE_LIMIT_SHORTEN_MAX) {
    return { allowed: false, message: SERVER_MESSAGES.RATE_LIMIT_EXCEEDED };
  }

  return { allowed: true };
}
