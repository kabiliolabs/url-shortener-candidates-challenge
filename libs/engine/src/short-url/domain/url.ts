import { ShortUrlError } from "../errors";

export type OriginalUrl = string & { readonly __brand: "OriginalUrl" };

const MAX_ORIGINAL_URL_LENGTH = 2048;
const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);
const ASCII_CONTROL_CHARACTER_PATTERN = /[\u0000-\u001F\u007F]/;

export function createOriginalUrl(value: string): OriginalUrl {
  const candidate = value.trim();

  if (!candidate) {
    throw new ShortUrlError("invalid_original_url", "URL is required");
  }

  if (candidate.length > MAX_ORIGINAL_URL_LENGTH) {
    throw new ShortUrlError("invalid_original_url", "URL is too long");
  }

  if (ASCII_CONTROL_CHARACTER_PATTERN.test(candidate)) {
    throw new ShortUrlError(
      "invalid_original_url",
      "URL contains unsupported characters",
    );
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(candidate);
  } catch {
    throw new ShortUrlError("invalid_original_url", "URL is invalid");
  }

  if (!ALLOWED_PROTOCOLS.has(parsedUrl.protocol)) {
    throw new ShortUrlError(
      "invalid_original_url",
      "URL protocol must be HTTP or HTTPS",
    );
  }

  return parsedUrl.toString() as OriginalUrl;
}
