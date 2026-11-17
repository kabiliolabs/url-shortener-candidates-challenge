import { ShortUrlNotFound } from "../domain/errors";
import type { ShortUrlRepository } from "../domain/short-url-repository";

export class ResolveShortUrl {
  constructor(private readonly repository: ShortUrlRepository) {}

  /** Resolving a short URL is what counts as a click. */
  async execute(code: string): Promise<string> {
    const shortUrl = await this.repository.registerClick(code);
    if (!shortUrl) throw new ShortUrlNotFound(code);
    return shortUrl.originalUrl;
  }
}
