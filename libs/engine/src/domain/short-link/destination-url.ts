import { InvalidDestinationUrlError } from "../errors/invalid-destination-url.error";

export class DestinationUrl {
  static readonly MAX_LENGTH = 2048;

  // Only web schemes: javascript:, data:, file: etc. would turn a redirect into an attack vector.
  private static readonly ALLOWED_PROTOCOLS = ["http:", "https:"];
  private static readonly IP_LITERAL = /^(\d{1,3}(\.\d{1,3}){3}|\[.*\])$/;

  /** Trusted instantiation: does NOT validate (use `create` for new or user-provided input). */
  constructor(readonly value: string) {}

  // Validation lives in `create`, not the constructor: stored links must keep
  // resolving even if these rules get stricter later.
  static create(raw: string): DestinationUrl {
    const trimmed = raw.trim();
    if (trimmed.length === 0) {
      throw new InvalidDestinationUrlError("must not be empty");
    }
    // Checked before parsing so huge inputs are rejected cheaply.
    DestinationUrl.assertLength(trimmed);

    // WHATWG URL silently strips tabs/newlines, so the stored value would differ from what was typed.
    if (/[\u0000-\u001F\u007F]/.test(trimmed)) {
      throw new InvalidDestinationUrlError(
        "must not contain control characters",
      );
    }

    let url: URL;
    try {
      url = new URL(trimmed);
    } catch {
      throw new InvalidDestinationUrlError("must be a valid absolute URL");
    }

    if (!DestinationUrl.ALLOWED_PROTOCOLS.includes(url.protocol)) {
      throw new InvalidDestinationUrlError("only http and https are allowed");
    }
    if (url.hostname.length === 0) {
      throw new InvalidDestinationUrlError("must have a hostname");
    }
    const host = url.hostname.replace(/\.$/, "");
    if (!host.includes(".")) {
      throw new InvalidDestinationUrlError("must use a public domain name");
    }
    if (DestinationUrl.IP_LITERAL.test(host)) {
      throw new InvalidDestinationUrlError("must use a domain name, not an IP address");
    }

    if (url.username || url.password) {
      throw new InvalidDestinationUrlError("must not contain credentials");
    }
    // Normalization (e.g. percent-encoding) can grow the string, so check again.
    DestinationUrl.assertLength(url.href);

    return new DestinationUrl(url.href);
  }

  private static assertLength(value: string): void {
    if (value.length > DestinationUrl.MAX_LENGTH) {
      throw new InvalidDestinationUrlError(
        `is too long (max ${DestinationUrl.MAX_LENGTH} characters)`,
      );
    }
  }

  equals(other: DestinationUrl): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
