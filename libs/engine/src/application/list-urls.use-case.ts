import { ShortenedUrl } from "../domain/shortened-url";
import type { UrlRepository } from "../domain/url-repository.port";

export class ListUrlsUseCase {
  constructor(private readonly repository: UrlRepository) {}

  async execute(): Promise<ShortenedUrl[]> {
    const urls = await this.repository.findAll();
    return urls.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
