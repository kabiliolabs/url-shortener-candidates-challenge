import { ShortUrlNotFoundError } from "../domain/errors";
import type { ShortUrl } from "../domain/short-url";
import type { UrlRepository } from "../domain/url-repository";

export class ResolveAndTrackClick {
  constructor(private readonly urlRepository: UrlRepository) {}

  async execute(code: string): Promise<ShortUrl> {
    const shortUrl = await this.urlRepository.incrementClicks(code);

    if (!shortUrl) {
      throw new ShortUrlNotFoundError(code);
    }

    return shortUrl;
  }
}
