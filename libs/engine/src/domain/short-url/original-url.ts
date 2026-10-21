import { InvalidUrlError } from "../errors";

const MAX_LENGTH = 2048;
const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

// Looks like "scheme:" but not "host:port". Without the (?!\d) part,
// "localhost:3000" would be read as a URL with scheme "localhost".
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:(?!\d)/i;

/**
 * The destination of a short URL (SPEC-002). If you have an instance, it's valid:
 * http(s) only, parseable, with a real hostname and not too long.
 */
export class OriginalUrl {
  private constructor(private readonly url: URL) {}

  static readonly MAX_LENGTH = MAX_LENGTH;

  static create(raw: string): OriginalUrl {
    const input = raw.trim();
    if (!input) {
      throw InvalidUrlError.required();
    }

    // People paste "example.com" all the time, so assume https like browsers do.
    const candidate = HAS_SCHEME.test(input) ? input : `https://${input}`;
    if (candidate.length > MAX_LENGTH) {
      throw InvalidUrlError.tooLong(MAX_LENGTH);
    }

    let url: URL;
    try {
      url = new URL(candidate);
    } catch {
      throw InvalidUrlError.malformed();
    }

    // This is what blocks javascript:, data:, file: and friends.
    if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
      throw InvalidUrlError.unsupportedScheme();
    }

    // "https://foo" parses fine but isn't a real site.
    if (url.hostname !== "localhost" && !url.hostname.includes(".")) {
      throw InvalidUrlError.malformed();
    }

    return new OriginalUrl(url);
  }

  get value(): string {
    return this.url.href;
  }

  /** Compares host + port, e.g. "localhost:3000". Used to block links to ourselves. */
  hasHost(host: string): boolean {
    return this.url.host === host.toLowerCase();
  }
}
