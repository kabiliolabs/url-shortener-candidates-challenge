import { InvalidShortCodeError } from "../errors";

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const LENGTH = 7;
const PATTERN = new RegExp(`^[0-9A-Za-z]{${LENGTH}}$`);

/**
 * The public identifier of a short URL (SPEC-003).
 * 62^7 ≈ 3.5 trillion combinations, so collisions are rare but still handled by the use case.
 */
export class ShortCode {
  static readonly ALPHABET = ALPHABET;
  static readonly LENGTH = LENGTH;

  private constructor(readonly value: string) {}

  static create(value: string): ShortCode {
    if (!ShortCode.isValid(value)) {
      throw new InvalidShortCodeError(value);
    }
    return new ShortCode(value);
  }

  /** Cheap format check, handy to reject garbage before hitting the database. */
  static isValid(value: string): boolean {
    return PATTERN.test(value);
  }

  equals(other: ShortCode): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
