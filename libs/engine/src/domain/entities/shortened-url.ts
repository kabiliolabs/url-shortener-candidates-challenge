import type { ShortCode } from "../value-objects/short-code";
import type { LongUrl } from "../value-objects/long-url";

export class ShortenedUrl {
  constructor(
    readonly shortCode: ShortCode,
    readonly longUrl: LongUrl,
  ) {}

  equals(other: ShortenedUrl): boolean {
    return this.shortCode.equals(other.shortCode);
  }
}
