import { InvalidShortCodeError } from "./errors";

const SHORT_CODE_LENGTH = 7;
const SHORT_CODE_PATTERN = /^[A-Za-z0-9_-]+$/;

export class ShortCode {
  private constructor(public readonly value: string) {}

  static readonly LENGTH = SHORT_CODE_LENGTH;

  static parse(raw: string): ShortCode {
    if (raw.length !== SHORT_CODE_LENGTH) {
      throw new InvalidShortCodeError(
        `expected ${SHORT_CODE_LENGTH} characters, got ${raw.length}`,
      );
    }
    if (!SHORT_CODE_PATTERN.test(raw)) {
      throw new InvalidShortCodeError("contains illegal characters");
    }
    return new ShortCode(raw);
  }

  /**
   * Reconstruct from a trusted source (e.g. database row). Skips validation.
   * Use only for values that have previously passed {@link ShortCode.parse}.
   */
  static fromTrusted(raw: string): ShortCode {
    return new ShortCode(raw);
  }

  toString(): string {
    return this.value;
  }
}
