/**
 * Minimal fixed-window rate limiter (abuse prevention).
 *
 * Deliberately in-memory: it is a single container, and this keeps the
 * dependency count at zero. It is the right shape, not the right scale — with
 * more than one instance this must move to Redis or to the edge/CDN layer,
 * which is noted in CHALLENGE_SUBMISSION.md.
 */
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;
const MAX_TRACKED_CLIENTS = 10_000;

type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();

export type RateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterSeconds: number };

export function checkRateLimit(request: Request, now = Date.now()): RateLimitResult {
  const key = clientKey(request);
  const current = windows.get(key);

  if (!current || current.resetAt <= now) {
    pruneIfNeeded(now);
    windows.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }

  if (current.count >= MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - current.count };
}

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/** Keeps the map from growing without bound under a distributed flood. */
function pruneIfNeeded(now: number): void {
  if (windows.size < MAX_TRACKED_CLIENTS) return;
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
}
