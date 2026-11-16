import { InvalidUrlError } from "./errors";

export const MAX_URL_LENGTH = 2048;

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

function parseUrl(url: string): URL {
  try {
    return new URL(url);
  } catch {
    throw new InvalidUrlError("URL is not valid");
  }
}

/**
 * Throws InvalidUrlError with the specific reason when `url` must not be shortened.
 * `ownHostname` is this service's own hostname; URLs pointing at it would loop back into the shortener.
 */
export function assertShortenable(url: string, ownHostname?: string): void {
  if (!url) {
    throw new InvalidUrlError("URL is required");
  }

  if (url.length > MAX_URL_LENGTH) {
    throw new InvalidUrlError(
      `URL must be at most ${MAX_URL_LENGTH} characters`,
    );
  }

  const parsed = parseUrl(url);

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    throw new InvalidUrlError("Only http and https URLs are allowed");
  }

  if (!parsed.hostname) {
    throw new InvalidUrlError("URL is not valid");
  }

  if (ownHostname && parsed.hostname === ownHostname.toLowerCase()) {
    throw new InvalidUrlError("URL cannot point to this service");
  }
}
