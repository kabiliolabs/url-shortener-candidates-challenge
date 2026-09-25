const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;

/** Per-IP sliding window. HTTP-boundary concern, not a domain rule - lives
 * in the route layer, not libs/engine. In-memory/single-instance by design. */
const requestLog = new Map<string, number[]>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterMs?: number;
}

/** No reverse proxy sits in front of this app's docker-compose setup, so
 * `x-forwarded-for` is only meaningful if one is added later; falls back to
 * a single shared bucket otherwise (documented single-instance limitation). */
export function getClientKey(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
}

export function checkRateLimit(
  key: string,
  now: number = Date.now(),
): RateLimitResult {
  const windowStart = now - WINDOW_MS;
  const recent = (requestLog.get(key) ?? []).filter((t) => t > windowStart);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    requestLog.set(key, recent);
    return { allowed: false, retryAfterMs: recent[0] + WINDOW_MS - now };
  }

  recent.push(now);
  requestLog.set(key, recent);
  return { allowed: true };
}
