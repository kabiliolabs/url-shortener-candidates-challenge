import type { LongUrl } from "./long-url";
import type { ShortCode } from "./short-code";

export interface ShortenedUrl {
  code: ShortCode;
  longUrl: LongUrl;
  createdAt: Date;
  clickCount: number;
  lastClickedAt: Date | null;
}
