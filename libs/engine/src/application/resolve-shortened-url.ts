import { InvalidShortCodeError, ShortenedUrlNotFoundError } from "../domain/errors";
import { ShortCode } from "../domain/short-code";
import type { ShortenedUrl } from "../domain/shortened-url";
import type { ShortenedUrlRepository } from "../domain/shortened-url-repository";

/**
 * Use case: resolve a short code and count the visit.
 *
 * Resolving and counting are one operation on purpose — it is impossible to
 * redirect without recording the click, which is what the statistics require.
 */
export class ResolveShortenedUrl {
  constructor(private readonly repository: ShortenedUrlRepository) {}

  async execute(rawCode: unknown): Promise<ShortenedUrl> {
    let code: ShortCode;
    try {
      code = ShortCode.parse(rawCode);
    } catch (error) {
      // A malformed code cannot possibly exist: same outcome as a missing one.
      if (error instanceof InvalidShortCodeError) {
        throw new ShortenedUrlNotFoundError("This short link does not exist.");
      }
      throw error;
    }

    const shortenedUrl = await this.repository.registerClick(code);
    if (!shortenedUrl) {
      throw new ShortenedUrlNotFoundError("This short link does not exist.");
    }

    return shortenedUrl;
  }
}
