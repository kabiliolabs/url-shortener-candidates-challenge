import type { RateLimiterPort } from "@url-shortener/engine";

export class InMemoryRateLimiter implements RateLimiterPort {
  private readonly windows = new Map<string, number[]>();

  constructor(
    private readonly maxRequests: number,
    private readonly windowMs: number,
  ) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const cutoff = now - this.windowMs;
    const recent = (this.windows.get(identifier) ?? []).filter((t) => t > cutoff);

    if (recent.length >= this.maxRequests) {
      this.windows.set(identifier, recent);
      return false;
    }

    recent.push(now);
    this.windows.set(identifier, recent);
    return true;
  }
}
