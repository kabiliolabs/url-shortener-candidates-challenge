import { ShortenedUrl } from '../domain/entities/shortened-url';
import { Url } from '../domain/value-objects/url';
import { ShortCodeGenerator } from '../domain/services/short-code-generator';
import type { UrlRepositoryPort } from '../ports/url-repository-port';

export class ShortenUrlUseCase {
  constructor(
    private readonly generator: ShortCodeGenerator,
    private readonly repository: UrlRepositoryPort
  ) { }

  async execute(targetUrl: string): Promise<ShortenedUrl> {
    const code = await this.generator.generate();
    const shortUrl = ShortenedUrl.create(code, new Url(targetUrl));
    await this.repository.save(shortUrl);
    return shortUrl;
  }
}