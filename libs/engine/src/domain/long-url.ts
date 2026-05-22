import { InvalidUrlError } from "./errors";

const MAX_URL_LENGTH = 2048;
const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

export interface ParseLongUrlOptions {
  forbiddenHost?: string;
}

export class LongUrl {
  private constructor(public readonly value: string) {}

  static parse(raw: unknown, opts: ParseLongUrlOptions = {}): LongUrl {
    if (typeof raw !== "string") {
      throw new InvalidUrlError("URL is required");
    }
    const trimmed = raw.trim();
    if (trimmed.length === 0) {
      throw new InvalidUrlError("URL is required");
    }
    if (trimmed.length > MAX_URL_LENGTH) {
      throw new InvalidUrlError(`exceeds ${MAX_URL_LENGTH} characters`);
    }

    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      throw new InvalidUrlError("not a valid URL");
    }

    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
      throw new InvalidUrlError(
        `unsupported scheme '${parsed.protocol.replace(":", "")}' (only http and https are allowed)`,
      );
    }

    if (
      opts.forbiddenHost &&
      parsed.host.toLowerCase() === opts.forbiddenHost.toLowerCase()
    ) {
      throw new InvalidUrlError("cannot shorten a URL pointing at this service");
    }

    return new LongUrl(trimmed);
  }

  /**
   * Reconstruct from a trusted source (e.g. database row). Skips validation.
   * Use only for values that have previously passed {@link LongUrl.parse}.
   */
  static fromTrusted(value: string): LongUrl {
    return new LongUrl(value);
  }

  toString(): string {
    return this.value;
  }
}
