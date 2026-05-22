import { CodeCollisionError, RateLimitExceededError } from "../domain/errors";
import { LongUrl } from "../domain/long-url";
import type { CodeGenerator } from "../domain/ports/code-generator";
import { consoleLogger, type Logger } from "../domain/ports/logger";
import type { RateLimiter } from "../domain/ports/rate-limiter";
import type { RecentList } from "../domain/ports/recent-list";
import type { ShortenedUrlRepository } from "../domain/ports/shortened-url-repository";
import type { ShortCode } from "../domain/short-code";

const DEFAULT_MAX_RETRIES = 3;

export interface ShortenUrlInput {
  url: string;
  clientIp: string;
}

export interface ShortenUrlResult {
  code: ShortCode;
  shortUrl: string;
}

export interface ShortenUrlDeps {
  repository: ShortenedUrlRepository;
  codeGenerator: CodeGenerator;
  rateLimiter: RateLimiter;
  baseUrl: string;
  forbiddenHost: string;
  maxCollisionRetries?: number;
  recentList?: RecentList;
  logger?: Logger;
}

export type ShortenUrlUseCase = (input: ShortenUrlInput) => Promise<ShortenUrlResult>;

export function makeShortenUrlUseCase(deps: ShortenUrlDeps): ShortenUrlUseCase {
  const maxRetries = deps.maxCollisionRetries ?? DEFAULT_MAX_RETRIES;
  const logger = deps.logger ?? consoleLogger;

  return async function shortenUrl(input) {
    const decision = await deps.rateLimiter.consume(input.clientIp);
    if (!decision.allowed) {
      throw new RateLimitExceededError(decision.retryAfterSeconds);
    }

    const longUrl = LongUrl.parse(input.url, { forbiddenHost: deps.forbiddenHost });

    let lastCollision: CodeCollisionError | undefined;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const code = deps.codeGenerator.generate();
      try {
        await deps.repository.save(code, longUrl);
        // Fire-and-forget — a Redis miss here must not fail the user request;
        // the home page falls back to the repository if the list is empty.
        deps.recentList
          ?.push(code.value)
          .catch((err) => logger.warn({ err }, "shortenUrl: recent-list push failed"));
        return {
          code,
          shortUrl: `${deps.baseUrl}/s/${code.value}`,
        };
      } catch (err) {
        if (err instanceof CodeCollisionError) {
          lastCollision = err;
          continue;
        }
        throw err;
      }
    }
    throw (
      lastCollision ??
      new Error(`Failed to allocate short code after ${maxRetries} attempts`)
    );
  };
}
