import {
  ShortCode,
  ShortCodeAlreadyExistsError,
  ShortUrl,
  type Clock,
  type ListOptions,
  type ListResult,
  type RateLimiter,
  type RateLimitResult,
  type ShortCodeGenerator,
  type ShortUrlRepository,
} from "../src";

// Test doubles for the ports. Simple on purpose: use cases are tested without any DB.

export class InMemoryShortUrlRepository implements ShortUrlRepository {
  readonly items = new Map<string, ShortUrl>();

  async save(shortUrl: ShortUrl): Promise<void> {
    if (this.items.has(shortUrl.code.value)) {
      throw new ShortCodeAlreadyExistsError(shortUrl.code.value);
    }
    this.items.set(shortUrl.code.value, shortUrl);
  }

  async registerClick(code: ShortCode, at: Date): Promise<ShortUrl | null> {
    const current = this.items.get(code.value);
    if (!current) return null;

    const updated = ShortUrl.restore({
      code: current.code,
      originalUrl: current.originalUrl,
      createdAt: current.createdAt,
      clicks: current.clicks + 1,
      lastClickedAt: at,
    });
    this.items.set(code.value, updated);
    return updated;
  }

  async list({ offset, limit }: ListOptions): Promise<ListResult> {
    const sorted = [...this.items.values()].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    return { items: sorted.slice(offset, offset + limit), total: sorted.length };
  }
}

/** Hands out the given codes in order, so tests can force collisions. */
export class SequenceCodeGenerator implements ShortCodeGenerator {
  private index = 0;

  constructor(private readonly codes: string[]) {}

  generate(): ShortCode {
    const code = this.codes[Math.min(this.index++, this.codes.length - 1)];
    return ShortCode.create(code);
  }
}

export class FixedClock implements Clock {
  constructor(public current = new Date("2026-01-01T10:00:00Z")) {}

  now(): Date {
    return this.current;
  }

  advance(ms: number): void {
    this.current = new Date(this.current.getTime() + ms);
  }
}

export class StubRateLimiter implements RateLimiter {
  readonly keys: string[] = [];

  constructor(public result: RateLimitResult = { allowed: true, retryAfterSeconds: 0 }) {}

  async consume(key: string): Promise<RateLimitResult> {
    this.keys.push(key);
    return this.result;
  }
}
