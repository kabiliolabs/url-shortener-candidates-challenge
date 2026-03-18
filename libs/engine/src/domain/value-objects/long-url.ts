export class LongUrl {
  readonly value: string;

  constructor(raw: string) {
    let parsed: URL;
    try {
      parsed = new URL(raw);
    } catch {
      throw new Error(`Invalid URL: "${raw}"`);
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error(`URL must use http or https: "${raw}"`);
    }
    this.value = parsed.href;
  }

  equals(other: LongUrl): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
