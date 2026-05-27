import { ShortUrlError, type ShortUrl } from "@url-shortener/engine";
import { getPublicUrl } from "./config.server";
import { ShortUrlRequestError } from "./security.server";

export interface ShortUrlListItem {
  code: string;
  originalUrl: string;
  shortenedUrl: string;
  clickCount: number;
  createdAt: string;
}

export function createShortenedUrl(code: string): string {
  return `${getPublicUrl()}/s/${code}`;
}

export function toShortUrlListItem(shortUrl: ShortUrl): ShortUrlListItem {
  return {
    code: shortUrl.code,
    originalUrl: shortUrl.originalUrl,
    shortenedUrl: createShortenedUrl(shortUrl.code),
    clickCount: shortUrl.clickCount,
    createdAt: shortUrl.createdAt.toISOString(),
  };
}

export function getFormError(error: unknown): string | null {
  if (error instanceof ShortUrlRequestError) {
    return error.message;
  }

  if (!(error instanceof ShortUrlError)) {
    return null;
  }

  switch (error.code) {
    case "invalid_original_url":
      return error.message;
    case "code_generation_failed":
      return "Could not create a short URL. Please try again.";
    case "invalid_short_code":
    case "short_url_not_found":
      return "The requested short URL could not be found.";
  }
}

export function isNotFoundShortUrlError(error: unknown): boolean {
  return (
    error instanceof ShortUrlError &&
    (error.code === "short_url_not_found" || error.code === "invalid_short_code")
  );
}
