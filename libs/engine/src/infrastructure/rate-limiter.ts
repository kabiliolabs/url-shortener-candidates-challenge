import { rateLimit } from "./config";

const MAX_TRACKED_CLIENTS = 10_000;

export class RateLimitExceededError extends Error {
  constructor(public readonly retryAfterSeconds: number) {
    super(`Too many requests. Try again in ${retryAfterSeconds} seconds.`);
    this.name = "RateLimitExceededError";
  }
}

interface RateLimiterOptions {
  limit: number;
  windowMs: number;
  now?: () => number;
}

interface Window {
  count: number;
  resetAt: number;
}

/**
 * In-memory fixed-window limiter.
 * shortcut: per-process state, reset on restart and not shared across instances; move to Redis if the app scales out.
 */
export function createRateLimiter({ limit, windowMs, now = Date.now }: RateLimiterOptions) {
  const windows = new Map<string, Window>();

  function evictExpired(current: number) {
    for (const [key, window] of windows) {
      if (window.resetAt <= current) {
        windows.delete(key);
      }
    }
  }

  return function checkRateLimit(key: string): void {
    const current = now();

    if (windows.size >= MAX_TRACKED_CLIENTS) {
      evictExpired(current);
    }

    let window = windows.get(key);
    if (!window || window.resetAt <= current) {
      window = { count: 0, resetAt: current + windowMs };
      windows.set(key, window);
    }

    window.count += 1;

    if (window.count > limit) {
      throw new RateLimitExceededError(Math.ceil((window.resetAt - current) / 1000));
    }
  };
}

/**
 * shortcut: trusts X-Forwarded-For, which a client can spoof unless a proxy overwrites it; without the header
 * all clients share one bucket. Upgrade by reading the socket address through a custom server's load context.
 */
export function clientKey(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "anonymous";
}

export const checkShortenRateLimit = createRateLimiter(rateLimit);
