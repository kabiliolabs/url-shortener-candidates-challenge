export class OriginalUrl {
  private constructor(readonly value: string) {}

  static fromStorage(value: string): OriginalUrl {
    return new OriginalUrl(value);
  }

  static create(raw: string): OriginalUrl {
    const trimmed = raw.trim();

    if (!trimmed) {
      throw new Error("URL is required");
    }

    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      throw new Error("Invalid URL format");
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("URL must use http or https protocol");
    }

    if (!parsed.hostname.includes(".") && parsed.hostname !== "localhost") {
      throw new Error("URL must have a valid domain");
    }

    return new OriginalUrl(parsed.toString());
  }

  toString(): string {
    return this.value;
  }
}
