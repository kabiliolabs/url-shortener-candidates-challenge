import type { ShortUrl } from "../domain/short-url";
import type { ShortUrlRepository } from "../ports/short-url-repository";

export interface ListShortUrlsDependencies {
  repository: ShortUrlRepository;
}

export async function listShortUrls(
  dependencies: ListShortUrlsDependencies,
): Promise<ShortUrl[]> {
  return dependencies.repository.findAll();
}
