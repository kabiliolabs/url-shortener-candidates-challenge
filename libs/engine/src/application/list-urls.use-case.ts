import { ShortenedUrl } from "../domain/shortened-url";
import type { UrlListPort } from "../domain/url-repository.port";

export class ListUrlsUseCase {
  constructor(private readonly repository: UrlListPort) {}

  async execute(): Promise<ShortenedUrl[]> {
    return this.repository.findAll();
  }
}
