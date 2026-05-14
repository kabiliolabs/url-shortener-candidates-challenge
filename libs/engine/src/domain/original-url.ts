import isURL from "validator/lib/isURL";
import { UrlRequiredError } from "./url-required-error";
import { InvalidUrlError } from "./invalid-url-error";

export class OriginalUrl {
  private constructor(readonly value: string) {}

  static fromStorage(value: string): OriginalUrl {
    return new OriginalUrl(value);
  }

  static create(raw: string): OriginalUrl {
    const trimmed = raw.trim();

    if (!trimmed) {
      throw new UrlRequiredError();
    }

    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      throw new InvalidUrlError("Invalid URL format");
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new InvalidUrlError("URL must use http or https protocol");
    }

    const isLocalhost = parsed.hostname === "localhost";
    if (!isLocalhost) {
      const valid = isURL(trimmed, {
        protocols: ["http", "https"],
        require_protocol: true,
        require_tld: true,
      });

      if (!valid) {
        throw new InvalidUrlError(
          parsed.hostname.includes(".")
            ? "Invalid URL format"
            : "URL must have a valid domain"
        );
      }
    }

    return new OriginalUrl(parsed.toString());
  }

  toString(): string {
    return this.value;
  }
}
