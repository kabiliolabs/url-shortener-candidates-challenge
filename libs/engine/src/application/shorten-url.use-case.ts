import { randomUUID } from "crypto";
import { OriginalUrl } from "../domain/original-url";
import { ShortenedUrl } from "../domain/shortened-url";
import { ShortCodeCollisionError } from "../domain/short-code-collision-error";
import type { UrlSavePort } from "../domain/url-repository.port";
import type { RateLimiterPort } from "./ports/rate-limiter.port";
import { RateLimitExceededError } from "./rate-limit-exceeded-error";

const MAX_CODE_RETRIES = 3;

export class ShortenUrlUseCase {
  constructor(
    private readonly repository: UrlSavePort,
    private readonly rateLimiter: RateLimiterPort,
  ) {}

  async execute(rawUrl: string, clientId: string): Promise<ShortenedUrl> {
    if (!this.rateLimiter.isAllowed(clientId)) {
      throw new RateLimitExceededError();
    }

    const originalUrl = OriginalUrl.create(rawUrl);
    const existing = await this.repository.findByOriginalUrl(originalUrl.value);
    if (existing) return existing;

    // Retry only on short code collision (astronomically rare)
    let lastErr: unknown;
    for (let attempt = 0; attempt < MAX_CODE_RETRIES; attempt++) {
      const shortened = ShortenedUrl.create(randomUUID(), originalUrl);
      try {
        await this.repository.save(shortened);
        return shortened;
      } catch (err) {
        if (!(err instanceof ShortCodeCollisionError)) throw err;
        lastErr = err;
      }
    }
    throw lastErr;
  }
}
