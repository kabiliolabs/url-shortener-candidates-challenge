import { DestinationUrl } from "./destination-url";
import { ShortCode, type RandomIntSource } from "./short-code";

/**
 * The aggregate. Immutable on purpose: click counting is an atomic operation in
 * the database (see the repository), not a read-modify-write in memory, which
 * would lose clicks under concurrency.
 */
export class ShortenedUrl {
  constructor(
    readonly code: ShortCode,
    readonly destination: DestinationUrl,
    readonly clicks: number,
    readonly createdAt: Date,
    readonly lastVisitedAt: Date | null,
  ) {}

  static create(
    destination: DestinationUrl,
    randomInt?: RandomIntSource,
    now: Date = new Date(),
  ): ShortenedUrl {
    return new ShortenedUrl(ShortCode.random(randomInt), destination, 0, now, null);
  }

  /** Absolute short link, built from the public base URL of the deployment. */
  shortUrl(baseUrl: string): string {
    return `${baseUrl.replace(/\/+$/, "")}/s/${this.code.value}`;
  }
}
