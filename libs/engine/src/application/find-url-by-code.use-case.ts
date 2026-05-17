import { ShortenedUrl } from "../domain/shortened-url";
import type { UrlLookupPort } from "../domain/url-repository.port";
import { UrlNotFoundError } from "./url-not-found-error";

export class FindUrlByCodeUseCase {
  constructor(private readonly repository: UrlLookupPort) {}

  async execute(code: string): Promise<ShortenedUrl> {
    const url = await this.repository.findByCode(code);
    if (!url) {
      throw new UrlNotFoundError(code);
    }
    return url;
  }
}
