import { InvalidUrlError } from "./errors";

// Common practical limit across browsers and proxies. It also bounds what one
// request can store.
const MAX_LENGTH = 2048;

// An allowlist, because the redirect sends visitors wherever this value points:
// `javascript:`, `data:` or `file:` must never be stored.
const ALLOWED_PROTOCOLS = ["http:", "https:"];

export class OriginalUrl {
  // Private so that an instance is proof the value passed validation.
  private constructor(readonly value: string) {}

  /**
   * @param blockedHosts hosts (with port, when not the default one) that cannot
   * be a destination. Checks run cheapest first, so each rejection reports the
   * most basic problem with the input.
   */
  static create(raw: string, blockedHosts: readonly string[]): OriginalUrl {
    const trimmed = raw.trim();

    if (trimmed === "") {
      throw new InvalidUrlError("Enter a URL.");
    }
    if (trimmed.length > MAX_LENGTH) {
      throw new InvalidUrlError(
        `The URL is too long (maximum ${MAX_LENGTH} characters).`,
      );
    }
    if (!URL.canParse(trimmed)) {
      throw new InvalidUrlError(
        "That doesn't look like a valid URL. Include http:// or https://.",
      );
    }

    const url = new URL(trimmed);

    if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
      throw new InvalidUrlError("Only http and https URLs can be shortened.");
    }
    // `url.host` is already lowercased and without default ports.
    if (blockedHosts.some((host) => host.toLowerCase() === url.host)) {
      throw new InvalidUrlError("URLs from this site can't be shortened.");
    }

    // The normalised form is stored, so equivalent inputs are saved identically.
    return new OriginalUrl(url.href);
  }
}
