import type { OriginalUrl } from "./original-url";
import type { ShortCode } from "./short-code";

export interface ShortUrlProps {
  code: ShortCode;
  originalUrl: OriginalUrl;
  clicks: number;
  createdAt: Date;
  lastClickedAt: Date | null;
}

/**
 * Aggregate root of the Shortening context.
 *
 * Clicks are not incremented here on purpose: doing load → increment → save would lose
 * clicks under concurrency, so the repository does it atomically (see ADR-004).
 */
export class ShortUrl {
  private constructor(private readonly props: ShortUrlProps) {}

  static create(params: { code: ShortCode; originalUrl: OriginalUrl; now: Date }): ShortUrl {
    return new ShortUrl({
      code: params.code,
      originalUrl: params.originalUrl,
      clicks: 0,
      createdAt: params.now,
      lastClickedAt: null,
    });
  }

  /** Rebuilds an existing short URL from storage. Only repositories should need this. */
  static restore(props: ShortUrlProps): ShortUrl {
    return new ShortUrl({ ...props });
  }

  get code(): ShortCode {
    return this.props.code;
  }

  get originalUrl(): OriginalUrl {
    return this.props.originalUrl;
  }

  get clicks(): number {
    return this.props.clicks;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get lastClickedAt(): Date | null {
    return this.props.lastClickedAt;
  }
}
