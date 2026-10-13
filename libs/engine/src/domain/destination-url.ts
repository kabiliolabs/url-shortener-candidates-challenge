import { InvalidDestinationUrlError } from "./errors";

export const MAX_URL_LENGTH = 2_048;

export class DestinationUrl {
  private constructor(readonly value: string) {}

  static create(input: string): DestinationUrl {
    const value = input.trim();

    if (!value) {
      throw new InvalidDestinationUrlError("URL is required.");
    }

    if (value.length > MAX_URL_LENGTH) {
      throw new InvalidDestinationUrlError(
        `URL must be ${MAX_URL_LENGTH} characters or less.`,
      );
    }

    let parsed: URL;
    try {
      parsed = new URL(value);
    } catch {
      throw new InvalidDestinationUrlError(
        "Please enter a valid URL, including https://.",
      );
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new InvalidDestinationUrlError(
        "Only HTTP and HTTPS URLs are supported.",
      );
    }

    if (!parsed.hostname) {
      throw new InvalidDestinationUrlError("Please enter a valid URL.");
    }

    return new DestinationUrl(value);
  }
}
