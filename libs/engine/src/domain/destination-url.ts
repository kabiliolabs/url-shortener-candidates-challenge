import { InvalidUrlError } from "./errors";

/**
 * Value object for the URL a short code points to.
 *
 * This is the single security boundary of the whole feature. The original code
 * stored any string, which meant `javascript:alert(1)` could be saved and then
 * served inside an `<a href>` (stored XSS) or handed to `redirect()`
 * (open redirect). Validation lives here, in the domain, so it cannot be
 * bypassed by adding a new entry point later.
 */
const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);
const MAX_LENGTH = 2048; // de-facto browser limit; also caps the payload size
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

export class DestinationUrl {
  private constructor(readonly value: string) {}

  static parse(raw: unknown): DestinationUrl {
    if (typeof raw !== "string" || raw.trim() === "") {
      throw new InvalidUrlError("Enter a URL to shorten.");
    }

    const trimmed = raw.trim();

    if (trimmed.length > MAX_LENGTH) {
      throw new InvalidUrlError(
        `That URL is too long (max ${MAX_LENGTH} characters).`,
      );
    }

    // Convenience: treat "example.com" as "https://example.com" so users are not
    // forced to type the scheme. An explicit scheme is always respected, which is
    // what keeps the protocol allowlist below meaningful.
    const candidate = HAS_SCHEME.test(trimmed) ? trimmed : `https://${trimmed}`;

    let parsed: URL;
    try {
      parsed = new URL(candidate);
    } catch {
      throw new InvalidUrlError("That does not look like a valid URL.");
    }

    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
      throw new InvalidUrlError(
        `Only http and https links can be shortened (got "${parsed.protocol}").`,
      );
    }

    if (!parsed.hostname || !isPlausibleHost(parsed.hostname)) {
      throw new InvalidUrlError("That URL is missing a valid domain.");
    }

    return new DestinationUrl(parsed.toString());
  }

  equals(other: DestinationUrl): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

function isPlausibleHost(hostname: string): boolean {
  if (hostname === "localhost") return true;
  // Require a dot so typos like "htps://foo" (which parses as host "foo") are
  // rejected instead of silently stored.
  return hostname.includes(".") && !hostname.startsWith(".") && !hostname.endsWith(".");
}
