import { InvalidUrlError } from "../errors";

/**
 * Allowed URL schemes. A URL shortener redirects to external addresses by
 * nature, so the redirect is not "fixed" but *validated*: only http/https are
 * accepted. Unsafe schemes (`javascript:`, `data:`, `file:`) and malformed
 * input are rejected here, at creation time — the single source of URL rules.
 */
const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

/**
 * Upper bound on URL length. Guards against storage bloat / abuse; 2048 is the
 * de-facto safe limit honored by browsers and most servers.
 */
const MAX_URL_LENGTH = 2048;

export class OriginalUrl {
  private constructor(public readonly value: string) {}

  /**
   * Parse and validate a raw URL string. The stored value is normalized via the
   * WHATWG URL parser (lowercased host, trailing slash, percent-encoding).
   * @throws {InvalidUrlError} when the input is not a valid http/https URL or
   * exceeds the length limit.
   */
  static create(raw: string): OriginalUrl {
    if (raw.length > MAX_URL_LENGTH) {
      throw new InvalidUrlError(raw);
    }

    let parsed: URL;
    try {
      parsed = new URL(raw);
    } catch {
      throw new InvalidUrlError(raw);
    }

    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
      throw new InvalidUrlError(raw);
    }

    return new OriginalUrl(parsed.href);
  }

  toString(): string {
    return this.value;
  }
}
