interface Bucket {
  tokens: number;
  lastRefill: number;
}

/** Burst size: how many requests a client can make back-to-back. */
const CAPACITY = 10;
/** Refill cadence: one token every 6s -> ~10 requests/minute sustained. */
const REFILL_INTERVAL_MS = 6_000;

const buckets = new Map<string, Bucket>();

/**
 * Token-bucket rate limiter, keyed by client (usually IP).
 *
 * Each key owns a bucket that starts full ({@link CAPACITY} tokens). Every
 * call spends one token; tokens refill over time at {@link REFILL_INTERVAL_MS}.
 * This allows short bursts while capping the sustained rate, which is enough to
 * stop casual flooding of the create endpoint.
 *
 * Limitation: state lives in process memory, so it is per-instance and resets
 * on restart. A multi-replica deployment would need a shared store (e.g. Redis).
 *
 * @param key - Stable client identifier (see {@link getClientIp}).
 * @returns Whether the request is allowed, plus a retry hint when throttled.
 */
export function checkRateLimit(key: string): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { tokens: CAPACITY, lastRefill: now };

  const elapsed = now - bucket.lastRefill;
  const refill = Math.floor(elapsed / REFILL_INTERVAL_MS);
  if (refill > 0) {
    bucket.tokens = Math.min(CAPACITY, bucket.tokens + refill);
    bucket.lastRefill = now;
  }

  if (bucket.tokens <= 0) {
    buckets.set(key, bucket);
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(REFILL_INTERVAL_MS / 1000),
    };
  }

  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Best-effort extraction of the client IP from a request.
 *
 * Prefers the first hop in `x-forwarded-for` (set by reverse proxies), then
 * `x-real-ip`, falling back to a constant so the limiter still groups unknown
 * clients together rather than throwing.
 */
export function getClientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
