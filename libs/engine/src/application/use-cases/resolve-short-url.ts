import { ShortUrlNotFoundError } from "../../domain/errors";
import { ShortCode } from "../../domain/short-url/short-code";
import type { ShortUrlRepository } from "../../domain/short-url/short-url-repository";
import type { Clock } from "../ports/clock";

export interface ResolveShortUrlDeps {
  repository: ShortUrlRepository;
  clock: Clock;
}

/** Finds where a short code points to and counts the click (SPEC-004). */
export class ResolveShortUrl {
  constructor(private readonly deps: ResolveShortUrlDeps) {}

  async execute(rawCode: string): Promise<{ originalUrl: string }> {
    // A malformed code can't exist, so don't bother the database.
    if (!ShortCode.isValid(rawCode)) {
      throw new ShortUrlNotFoundError(rawCode);
    }

    const shortUrl = await this.deps.repository.registerClick(
      ShortCode.create(rawCode),
      this.deps.clock.now(),
    );
    if (!shortUrl) {
      throw new ShortUrlNotFoundError(rawCode);
    }

    return { originalUrl: shortUrl.originalUrl.value };
  }
}
