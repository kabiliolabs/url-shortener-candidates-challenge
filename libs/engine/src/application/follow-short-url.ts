import { isValidShortCode } from "../domain/short-code";
import type { ShortUrlRepository } from "../ports/short-url-repository";

export class FollowShortUrl {
  constructor(
    private readonly repository: ShortUrlRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  /** Records the click and returns the URL to redirect to, or null when the code is unknown. */
  async execute(shortCode: string): Promise<string | null> {
    if (!isValidShortCode(shortCode)) return null;
    const shortUrl = await this.repository.recordClick(shortCode, this.now());
    return shortUrl?.originalUrl ?? null;
  }
}
