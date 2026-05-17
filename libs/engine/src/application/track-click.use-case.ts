import { ShortenedUrl } from "../domain/shortened-url";
import type { UrlRepository } from "../domain/url-repository.port";
import { UrlNotFoundError } from "./url-not-found-error";

export class TrackClickUseCase {
  constructor(private readonly repository: UrlRepository) {}

  async execute(code: string): Promise<ShortenedUrl> {
    const url = await this.repository.incrementClicks(code);
    if (!url) throw new UrlNotFoundError(code);
    return url;
  }
}
