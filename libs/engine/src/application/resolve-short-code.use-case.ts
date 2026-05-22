import { CodeNotFoundError, InvalidShortCodeError } from "../domain/errors";
import type { Cache } from "../domain/ports/cache";
import { consoleLogger, type Logger } from "../domain/ports/logger";
import type { ShortenedUrlRepository } from "../domain/ports/shortened-url-repository";
import { ShortCode } from "../domain/short-code";

export interface ResolveShortCodeDeps {
  repository: ShortenedUrlRepository;
  cache: Cache;
  cacheTtlSeconds: number;
  logger?: Logger;
}

const cacheKey = (code: string) => `shortcode:${code}`;

export type ResolveShortCodeUseCase = (rawCode: string) => Promise<string>;

export function makeResolveShortCodeUseCase(
  deps: ResolveShortCodeDeps,
): ResolveShortCodeUseCase {
  const logger = deps.logger ?? consoleLogger;

  return async function resolveShortCode(rawCode) {
    let code: ShortCode;
    try {
      code = ShortCode.parse(rawCode);
    } catch (err) {
      if (err instanceof InvalidShortCodeError) {
        throw new CodeNotFoundError(rawCode);
      }
      throw err;
    }

    const cached = await deps.cache.get(cacheKey(code.value));
    if (cached !== null) {
      fireAndForget(
        deps.repository.incrementClicks(code),
        logger,
        `Failed to increment clicks for ${code.value}`,
      );
      return cached;
    }

    const found = await deps.repository.findByCode(code);
    if (!found) {
      throw new CodeNotFoundError(code.value);
    }

    fireAndForget(
      deps.cache.set(cacheKey(code.value), found.longUrl.value, deps.cacheTtlSeconds),
      logger,
      `Failed to populate cache for ${code.value}`,
    );
    fireAndForget(
      deps.repository.incrementClicks(code),
      logger,
      `Failed to increment clicks for ${code.value}`,
    );
    return found.longUrl.value;
  };
}

function fireAndForget(promise: Promise<unknown>, logger: Logger, label: string): void {
  promise.catch((err) => logger.warn({ err }, label));
}
