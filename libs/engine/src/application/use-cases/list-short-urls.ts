import type { ShortUrl } from "../../domain/short-url";
import type { UrlRepository } from "../ports/url-repository";

export class ListShortUrls {
  constructor(private readonly repository: UrlRepository) {}

  async execute(): Promise<ShortUrl[]> {
    const records = await this.repository.list();
    return [...records].sort(
      (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
    );
  }
}
