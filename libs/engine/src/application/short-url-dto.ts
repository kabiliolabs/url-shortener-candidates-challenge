import type { ShortUrl } from "../domain/short-url/short-url";

/** Plain data returned by use cases, so adapters never depend on domain objects. */
export interface ShortUrlDto {
  code: string;
  originalUrl: string;
  clicks: number;
  createdAt: Date;
  lastClickedAt: Date | null;
}

export function toShortUrlDto(shortUrl: ShortUrl): ShortUrlDto {
  return {
    code: shortUrl.code.value,
    originalUrl: shortUrl.originalUrl.value,
    clicks: shortUrl.clicks,
    createdAt: shortUrl.createdAt,
    lastClickedAt: shortUrl.lastClickedAt,
  };
}
