import { randomUUID } from "crypto";
import { OriginalUrl } from "../domain/original-url";
import { ShortenedUrl } from "../domain/shortened-url";
import type { UrlRepository } from "../domain/url-repository.port";
import type { RateLimiterPort } from "./ports/rate-limiter.port";
import { RateLimitExceededError } from "./rate-limit-exceeded-error";

export class ShortenUrlUseCase {
  constructor(
    private readonly repository: UrlRepository,
    private readonly rateLimiter: RateLimiterPort,
  ) {}

  async execute(rawUrl: string, clientId: string): Promise<ShortenedUrl> {
    if (!this.rateLimiter.isAllowed(clientId)) {
      throw new RateLimitExceededError();
    }
    const originalUrl = OriginalUrl.create(rawUrl);
    const shortened = ShortenedUrl.create(randomUUID(), originalUrl);
    await this.repository.save(shortened);
    return shortened;
  }
}
