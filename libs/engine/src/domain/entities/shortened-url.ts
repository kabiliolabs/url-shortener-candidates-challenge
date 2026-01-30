import { ShortCode } from '../value-objects/short-code';
import { Url } from '../value-objects/url';

export class ShortenedUrl {
  readonly code: ShortCode;
  readonly targetUrl: Url;
  readonly createdAt: Date;
  public clicks: number = 0;

  private constructor(code: ShortCode, targetUrl: Url, createdAt: Date, clicks: number) {
    this.code = code;
    this.targetUrl = targetUrl;
    this.createdAt = createdAt;
    this.clicks = clicks;
  }

  static create(code: ShortCode, targetUrl: Url): ShortenedUrl {
    return new ShortenedUrl(code, targetUrl, new Date(), 0);
  }

  static fromPrimitives(plain: {
    code: string;
    targetUrl: string;
    createdAt: string;
    clicks: number;
  }): ShortenedUrl {
    return new ShortenedUrl(
      new ShortCode(plain.code),
      new Url(plain.targetUrl),
      new Date(plain.createdAt),
      plain.clicks
    );
  }

  incrementClicks(): void {
    this.clicks += 1;
  }
}