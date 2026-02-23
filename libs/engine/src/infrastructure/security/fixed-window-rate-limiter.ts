import { RateLimitError } from "../../shared/errors";
import type { AbuseProtectionPort } from "../../application/ports/abuse-protection.port";

interface CounterState {
  count: number;
  windowStart: number;
}

export class FixedWindowRateLimiter implements AbuseProtectionPort {
  private readonly counters = new Map<string, CounterState>();

  constructor(
    private readonly maxRequestsPerWindow: number,
    private readonly windowMs: number,
  ) {}

  async ensureCanCreate(ipAddress: string): Promise<void> {
    const ip = ipAddress || "anonymous";
    const now = Date.now();

    const current = this.counters.get(ip);

    if (!current || now - current.windowStart > this.windowMs) {
      this.counters.set(ip, { count: 1, windowStart: now });
      return;
    }

    if (current.count >= this.maxRequestsPerWindow) {
      throw new RateLimitError(
        "Too many requests. Please wait before creating a new short URL.",
      );
    }

    current.count += 1;
    this.counters.set(ip, current);
  }
}
