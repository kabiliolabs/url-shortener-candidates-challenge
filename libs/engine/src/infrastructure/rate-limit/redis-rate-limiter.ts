import type { Redis } from "ioredis";

import type { RateLimitDecision, RateLimiter } from "../../domain/ports/rate-limiter";

export interface RedisRateLimiterOptions {
  client: Redis;
  maxRequests: number;
  windowSeconds: number;
  keyPrefix?: string;
}

/**
 * Fixed-window counter implemented with INCR + EXPIRE.
 *
 * The first request in a window creates the key with INCR (count=1) and we
 * follow up with EXPIRE to bound the window. There is a benign race where two
 * concurrent "first" requests both observe ttl=-1 and both call EXPIRE; the
 * second call simply resets the window — at worst a caller gets a fresh budget
 * one window earlier than expected.
 */
export class RedisRateLimiter implements RateLimiter {
  private readonly prefix: string;

  constructor(private readonly opts: RedisRateLimiterOptions) {
    this.prefix = opts.keyPrefix ?? "ratelimit:";
  }

  async consume(key: string): Promise<RateLimitDecision> {
    const redisKey = `${this.prefix}${key}`;
    const pipeline = this.opts.client.multi();
    pipeline.incr(redisKey);
    pipeline.ttl(redisKey);
    const results = await pipeline.exec();

    const count = Number(results?.[0]?.[1] ?? 0);
    let ttl = Number(results?.[1]?.[1] ?? -1);

    if (ttl < 0) {
      await this.opts.client.expire(redisKey, this.opts.windowSeconds);
      ttl = this.opts.windowSeconds;
    }

    if (count > this.opts.maxRequests) {
      return { allowed: false, retryAfterSeconds: Math.max(1, ttl) };
    }
    return { allowed: true, retryAfterSeconds: 0 };
  }
}
