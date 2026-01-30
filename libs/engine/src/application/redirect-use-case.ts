import { ShortCode } from '../domain/value-objects/short-code';
import type { UrlRepositoryPort } from '../ports/url-repository-port';

export class RedirectUseCase {
  constructor(private readonly repository: UrlRepositoryPort) { }

  async execute(codeStr: string): Promise<string | null> {
    const code = new ShortCode(codeStr);
    const shortUrl = await this.repository.findByCode(code);
    if (!shortUrl) {
      return null;
    }
    await this.repository.incrementClicks(code);
    return shortUrl.targetUrl.toString();
  }
}