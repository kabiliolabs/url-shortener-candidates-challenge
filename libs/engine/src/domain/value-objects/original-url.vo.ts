import { ValidationError } from "../../shared/errors";

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

export class OriginalUrl {
  private constructor(readonly value: string) {}

  static create(raw: string): OriginalUrl {
    const trimmed = raw?.trim();

    if (!trimmed) {
      throw new ValidationError("URL is required.");
    }

    if (trimmed.length > 2048) {
      throw new ValidationError("URL is too long.");
    }

    let parsed: URL;

    try {
      parsed = new URL(trimmed);
    } catch {
      throw new ValidationError("URL format is invalid.");
    }

    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
      throw new ValidationError("Only http and https URLs are allowed.");
    }

    return new OriginalUrl(parsed.toString());
  }
}
