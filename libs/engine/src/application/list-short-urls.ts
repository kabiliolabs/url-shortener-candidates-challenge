import type { ShortUrl } from "../domain/short-url";
import type { ShortUrlRepository } from "../ports/short-url-repository";

export class ListShortUrls {
  constructor(private readonly repository: ShortUrlRepository) {}

  execute(): Promise<ShortUrl[]> {
    return this.repository.listNewestFirst();
  }
}
