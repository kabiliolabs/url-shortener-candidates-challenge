import { randomUUID } from "crypto";
import { OriginalUrl } from "../domain/original-url";
import { ShortenedUrl } from "../domain/shortened-url";
import type { UrlRepository } from "../domain/url-repository";

export class ShortenUrlUseCase {
  constructor(private readonly repository: UrlRepository) {}

  async execute(rawUrl: string): Promise<ShortenedUrl> {
    const originalUrl = OriginalUrl.create(rawUrl);
    const shortened = ShortenedUrl.create(randomUUID(), originalUrl);
    await this.repository.save(shortened);
    return shortened;
  }
}
