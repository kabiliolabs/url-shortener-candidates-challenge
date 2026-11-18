import type { ShortenedUrl } from "../../domain/entities/shortened-url";
import type { UrlRepository } from "../../domain/repositories/url-repository";

export class ListUrlsUseCase {
  constructor(private readonly urls: UrlRepository) {}

  async execute(): Promise<ShortenedUrl[]> {
    return this.urls.findAllActive();
  }
}
