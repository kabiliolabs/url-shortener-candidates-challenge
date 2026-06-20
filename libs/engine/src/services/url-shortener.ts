import { generateShortCode } from "../domain/short-code";
import { validateAndNormalizeUrl } from "../domain/url-validation";
import { CodeCollisionError, RetryExhaustedError } from "../domain/errors";
import type { ShortenedUrl, UrlRepository } from "../ports/url-repository";

export interface UrlShortenerOptions {
  /** Length of generated codes. Defaults to 7. */
  codeLength?: number;
  /** How many times to retry after a code collision. Defaults to 5. */
  maxRetries?: number;
  /** Override code generation (used in tests for deterministic codes). */
  generateCode?: () => string;
}

/**
 * Application service that turns a raw URL into a persisted short link.
 *
 * It depends only on the {@link UrlRepository} port, so it has no knowledge of
 * the database or web framework — the concrete repository is injected by the
 * caller. This is the single place that orchestrates validation, code
 * generation, and collision handling.
 */
export class UrlShortener {
  private readonly maxRetries: number;
  private readonly generateCode: () => string;

  constructor(
    private readonly repo: UrlRepository,
    options: UrlShortenerOptions = {},
  ) {
    const codeLength = options.codeLength ?? 7;
    this.maxRetries = options.maxRetries ?? 5;
    this.generateCode =
      options.generateCode ?? (() => generateShortCode({ length: codeLength }));
  }

  /**
   * Validates and normalizes `rawUrl`, then persists it under a freshly
   * generated unique code.
   *
   * Collisions are resolved optimistically: rather than checking for an
   * existing code first (which would race), it attempts an insert and, if the
   * repository reports a {@link CodeCollisionError}, generates a new code and
   * retries — up to `maxRetries` times.
   *
   * @param rawUrl - The untrusted URL from the user.
   * @returns The persisted {@link ShortenedUrl}.
   * @throws {InvalidUrlError} If the URL fails validation (repo is never hit).
   * @throws {RetryExhaustedError} If no free code was found within `maxRetries`.
   */
  async shorten(rawUrl: string): Promise<ShortenedUrl> {
    const originalUrl = validateAndNormalizeUrl(rawUrl);

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      const code = this.generateCode();
      try {
        return await this.repo.create({ code, originalUrl });
      } catch (error) {
        if (error instanceof CodeCollisionError) continue;
        throw error;
      }
    }
    throw new RetryExhaustedError(this.maxRetries);
  }
}
