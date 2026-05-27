import { createShortCode } from "../domain/short-code";
import type { ShortUrl } from "../domain/short-url";
import { ShortUrlError } from "../errors";
import type { ShortUrlRepository } from "../ports/short-url-repository";

export interface ResolveShortUrlInput {
  code: string;
}

export interface ResolveShortUrlDependencies {
  repository: ShortUrlRepository;
}

export async function resolveShortUrl(
  input: ResolveShortUrlInput,
  dependencies: ResolveShortUrlDependencies,
): Promise<ShortUrl> {
  const code = createShortCode(input.code);
  const shortUrl = await dependencies.repository.findByCode(code);

  if (!shortUrl) {
    throw new ShortUrlError("short_url_not_found", "Short URL was not found");
  }

  await dependencies.repository.incrementClicks(code);

  return {
    ...shortUrl,
    clickCount: shortUrl.clickCount + 1,
    updatedAt: new Date(),
  };
}
