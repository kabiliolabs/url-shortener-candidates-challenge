import { InvalidUrlError, ShortCodeAlreadyExistsError } from "../../domain/errors";
import { OriginalUrl } from "../../domain/short-url/original-url";
import { ShortUrl } from "../../domain/short-url/short-url";
import type { ShortCodeGenerator } from "../../domain/short-url/short-code-generator";
import type { ShortUrlRepository } from "../../domain/short-url/short-url-repository";
import { RateLimitExceededError, ShortCodeCollisionError } from "../errors";
import type { Clock } from "../ports/clock";
import type { RateLimiter } from "../ports/rate-limiter";
import { toShortUrlDto, type ShortUrlDto } from "../short-url-dto";

export interface ShortenUrlDeps {
  repository: ShortUrlRepository;
  codeGenerator: ShortCodeGenerator;
  rateLimiter: RateLimiter;
  clock: Clock;
  /** Our own public host (e.g. "localhost:3000"). Links to it are rejected to avoid loops. */
  ownHost?: string;
}

export interface ShortenUrlInput {
  url: string;
  /** Who's asking, usually the client IP. Used as the rate limit key. */
  clientId: string;
}

/** Creates a new short URL (SPEC-001, SPEC-002, SPEC-003, SPEC-007). */
export class ShortenUrl {
  static readonly MAX_ATTEMPTS = 5;

  constructor(private readonly deps: ShortenUrlDeps) {}

  async execute(input: ShortenUrlInput): Promise<ShortUrlDto> {
    const { repository, codeGenerator, rateLimiter, clock, ownHost } = this.deps;

    // Rate limit first, so invalid requests count too. Otherwise spamming garbage is free.
    const limit = await rateLimiter.consume(`shorten:${input.clientId}`);
    if (!limit.allowed) {
      throw new RateLimitExceededError(limit.retryAfterSeconds);
    }

    const originalUrl = OriginalUrl.create(input.url);
    if (ownHost && originalUrl.hasHost(ownHost)) {
      throw InvalidUrlError.ownDomain();
    }

    // The DB unique index is the real guarantee; we just retry when we lose the dice roll.
    for (let attempt = 1; attempt <= ShortenUrl.MAX_ATTEMPTS; attempt++) {
      const shortUrl = ShortUrl.create({
        code: codeGenerator.generate(),
        originalUrl,
        now: clock.now(),
      });

      try {
        await repository.save(shortUrl);
        return toShortUrlDto(shortUrl);
      } catch (error) {
        if (!(error instanceof ShortCodeAlreadyExistsError)) throw error;
      }
    }

    throw new ShortCodeCollisionError(ShortenUrl.MAX_ATTEMPTS);
  }
}
