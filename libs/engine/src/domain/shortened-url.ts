import { OriginalUrl } from "./original-url";
import { ShortCode } from "./short-code";

export class ShortenedUrl {
  constructor(
    readonly id: string,
    readonly shortCode: ShortCode,
    readonly originalUrl: OriginalUrl,
    readonly clicks: number,
    readonly createdAt: Date
  ) {}

  static create(id: string, originalUrl: OriginalUrl): ShortenedUrl {
    return new ShortenedUrl(
      id,
      ShortCode.generate(),
      originalUrl,
      0,
      new Date()
    );
  }

  incrementClicks(): ShortenedUrl {
    return new ShortenedUrl(
      this.id,
      this.shortCode,
      this.originalUrl,
      this.clicks + 1,
      this.createdAt
    );
  }
}
