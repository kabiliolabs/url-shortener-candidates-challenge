import {
  ShortCodeCollisionError,
  ShortCodeExhaustedError,
  ShortUrlNotFoundError,
} from "../domain/errors";
import type { IShortUrlRepository } from "../domain/repository";
import { generateShortCode, type ShortUrl } from "../domain/short-url";
import { validateUrl } from "../domain/url-validator";

const MAX_CREATE_ATTEMPTS = 5;

export interface CreateShortUrlResult {
  shortUrl: ShortUrl;
  shortenedUrl: string;
}

/**
 * Orchestrates domain rules over a persistence-agnostic repository.
 * Never reads process.env - baseUrl is passed in by the caller (route layer).
 */
export class ShortUrlService {
  constructor(private readonly repository: IShortUrlRepository) {}

  async createShortUrl(rawUrl: string, baseUrl: string): Promise<CreateShortUrlResult> {
    const originalUrl = validateUrl(rawUrl);

    for (let attempt = 0; attempt < MAX_CREATE_ATTEMPTS; attempt++) {
      const code = generateShortCode();
      try {
        const shortUrl = await this.repository.create({ code, originalUrl });
        return { shortUrl, shortenedUrl: `${baseUrl}/s/${code}` };
      } catch (error) {
        if (error instanceof ShortCodeCollisionError) {
          continue;
        }
        throw error;
      }
    }

    throw new ShortCodeExhaustedError();
  }

  async recordClickAndResolve(code: string): Promise<string> {
    const existing = await this.repository.findByCode(code);
    if (!existing) {
      throw new ShortUrlNotFoundError(code);
    }

    const updated = await this.repository.incrementClick(code);
    return updated.originalUrl;
  }

  async listShortUrls(): Promise<ShortUrl[]> {
    return this.repository.list();
  }
}
