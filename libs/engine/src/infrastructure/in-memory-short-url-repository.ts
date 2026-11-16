import { ShortCodeAlreadyExists } from "../domain/errors";
import type { OriginalUrl } from "../domain/original-url";
import type { ShortUrl } from "../domain/short-url";
import type { ShortUrlRepository } from "../domain/short-url-repository";

/** Test double: lets the use cases be tested without a database. */
export class InMemoryShortUrlRepository implements ShortUrlRepository {
  private readonly shortUrls = new Map<string, ShortUrl>();

  async create(code: string, originalUrl: OriginalUrl): Promise<ShortUrl> {
    if (this.shortUrls.has(code)) throw new ShortCodeAlreadyExists(code);
    const shortUrl = {
      code,
      originalUrl: originalUrl.value,
      clicks: 0,
      createdAt: new Date(),
    };
    this.shortUrls.set(code, shortUrl);
    return shortUrl;
  }

  async registerClick(code: string): Promise<ShortUrl | null> {
    const shortUrl = this.shortUrls.get(code);
    if (!shortUrl) return null;
    const updated = { ...shortUrl, clicks: shortUrl.clicks + 1 };
    this.shortUrls.set(code, updated);
    return updated;
  }

  async list(limit: number): Promise<ShortUrl[]> {
    // A Map keeps insertion order, so reversing it gives newest first even
    // when several entries share the same timestamp.
    return [...this.shortUrls.values()].reverse().slice(0, limit);
  }
}
