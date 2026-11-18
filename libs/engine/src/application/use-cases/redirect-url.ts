import type { ShortenedUrl } from "../../domain/entities/shortened-url";
import { UrlNotFoundError } from "../../domain/errors/url-not-found.error";
import type { UrlRepository } from "../../domain/repositories/url-repository";

export class RedirectUrlUseCase {
  constructor(private readonly urls: UrlRepository) {}

  async execute(shortCode: string): Promise<ShortenedUrl> {
    const shortenedUrl = await this.urls.findActiveByCode(shortCode);
    if (!shortenedUrl) {
      throw new UrlNotFoundError(shortCode);
    }

    await this.urls.incrementClickCount(shortenedUrl.id);

    return {
      ...shortenedUrl,
      clickCount: shortenedUrl.clickCount + 1,
    };
  }
}
