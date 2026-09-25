import { InvalidUrlError } from "./errors";

const MAX_URL_LENGTH = 2048;
const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

/** Validates and normalizes a submitted URL. Throws InvalidUrlError otherwise. */
export function validateUrl(rawUrl: string): string {
  const trimmed = typeof rawUrl === "string" ? rawUrl.trim() : "";

  if (trimmed.length === 0) {
    throw new InvalidUrlError("URL is required");
  }

  if (trimmed.length > MAX_URL_LENGTH) {
    throw new InvalidUrlError(`URL must be ${MAX_URL_LENGTH} characters or fewer`);
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new InvalidUrlError("Enter a valid URL, e.g. https://example.com");
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    throw new InvalidUrlError("Only http:// and https:// URLs are allowed");
  }

  return parsed.toString();
}
