import { isValidShortCode } from "../domain/short-code";
import type { ShortUrlRepository } from "../ports/short-url-repository";

export class FollowShortUrl {
  constructor(
    private readonly repository: ShortUrlRepository,
    private readonly reportClickTrackingError: (error: unknown, shortCode: string) => void,
    private readonly now: () => Date = () => new Date(),
  ) {}

  /** Returns the URL to redirect to, or null when the code is unknown. */
  async execute(shortCode: string): Promise<string | null> {
    if (!isValidShortCode(shortCode)) return null;

    const shortUrl = await this.repository.findByCode(shortCode);
    if (!shortUrl) return null;

    // Stats are secondary to redirecting: the write isn't awaited, so a failing or slow update
    // (e.g. lock contention on a popular link) can neither block nor delay the redirect.
    this.repository
      .recordClick(shortCode, this.now())
      .catch((error: unknown) => this.reportClickTrackingError(error, shortCode));

    return shortUrl.originalUrl;
  }
}
