import type { ShortUrl } from "../domain/short-url";
import type { ShortUrlRepository } from "../domain/short-url-repository";

// A fixed cap keeps the query bounded without building pagination yet.
const LIMIT = 100;

export class ListShortUrls {
  constructor(private readonly repository: ShortUrlRepository) {}

  execute(): Promise<ShortUrl[]> {
    return this.repository.list(LIMIT);
  }
}
