import type { ShortCode } from "./short-code";
import type { OriginalUrl } from "./url";

export interface ShortUrl {
  code: ShortCode;
  originalUrl: OriginalUrl;
  clickCount: number;
  createdAt: Date;
  updatedAt: Date;
}
