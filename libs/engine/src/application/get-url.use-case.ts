import { ShortenedUrl } from "../domain/shortened-url";
import type { UrlRepository } from "../domain/url-repository";

export class GetUrlUseCase {
  constructor(private readonly repository: UrlRepository) {}

  async execute(code: string): Promise<ShortenedUrl | null> {
    return this.repository.findByCode(code);
  }
}
