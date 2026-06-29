import { InvalidUrlError } from "../errors";

// Only http/https are accepted; unsafe schemes (javascript:, data:, file:)
// are rejected here, at creation time — the single source of URL rules.
const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

/** Guards against storage bloat/abuse; 2048 is the de-facto safe limit honored by browsers. */
const MAX_URL_LENGTH = 2048;

export class OriginalUrl {
  private constructor(public readonly value: string) {}

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
