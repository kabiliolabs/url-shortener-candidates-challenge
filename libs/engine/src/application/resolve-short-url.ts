import { ShortCode } from "../domain/value-objects/short-code";
import type { ShortUrlRepository } from "../domain/ports/short-url-repository";
import type { ShortenedUrl } from "../domain/shortened-url";

export type ResolveShortUrlDeps = {
  repository: ShortUrlRepository;
};

export type ResolveShortUrl = (code: string) => Promise<ShortenedUrl | null>;

export function resolveShortUrlUseCase({
  repository,
}: ResolveShortUrlDeps): ResolveShortUrl {
  return async (rawCode) => {
    const code = ShortCode.create(rawCode).value;

    const found = await repository.findByCode(code);
    if (!found) {
      return null;
    }

    await repository.incrementClicks(code);
    return found;
  };
}
