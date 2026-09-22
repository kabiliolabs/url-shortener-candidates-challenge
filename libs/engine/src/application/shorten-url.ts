import { ShortCodeGenerationError, ShortCodeTakenError } from "../domain/errors";
import { normalizeOriginalUrl } from "../domain/original-url";
import { generateShortCode } from "../domain/short-code";
import type { ShortUrl } from "../domain/short-url";
import type { ShortUrlRepository } from "../ports/short-url-repository";

const MAX_ATTEMPTS = 5;

export class ShortenUrl {
  constructor(
    private readonly repository: ShortUrlRepository,
    private readonly publicUrl: string,
    private readonly generateCode: () => string = generateShortCode,
  ) {}

  /** @throws UrlValidationError when the input is not an acceptable URL */
  async execute(rawUrl: string): Promise<ShortUrl> {
    const originalUrl = normalizeOriginalUrl(rawUrl, this.publicUrl);

    // Relying on the unique constraint instead of checking first avoids a race between check and insert.
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      try {
        return await this.repository.create({
          shortCode: this.generateCode(),
          originalUrl,
        });
      } catch (error) {
        if (!(error instanceof ShortCodeTakenError)) throw error;
      }
    }
    throw new ShortCodeGenerationError(MAX_ATTEMPTS);
  }
}
