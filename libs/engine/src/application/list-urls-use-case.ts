import type { UrlRepositoryPort } from '../ports/url-repository-port';
import type { ShortenedUrl } from '../domain/entities/shortened-url';

export class ListUrlsUseCase {
  constructor(private readonly repository: UrlRepositoryPort) { }

  async execute(): Promise<ShortenedUrl[]> {
    const urls = await this.repository.listAll();
    return urls.sort((a, b) => b.clicks - a.clicks);
  }
}