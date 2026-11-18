import type { ShortenedUrl } from "../../domain/entities/shortened-url";
import { UrlNotFoundError } from "../../domain/errors/url-not-found.error";
import type { UrlRepository } from "../../domain/repositories/url-repository";

export class GetUrlStatsUseCase {
  constructor(private readonly urls: UrlRepository) {}

  async execute(shortCode: string): Promise<ShortenedUrl> {
    const shortenedUrl = await this.urls.findActiveByCode(shortCode);
    if (!shortenedUrl) {
      throw new UrlNotFoundError(shortCode);
    }
    return shortenedUrl;
  }
}
