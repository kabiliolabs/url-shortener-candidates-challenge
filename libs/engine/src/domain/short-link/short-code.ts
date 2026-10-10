import { InvalidShortCodeError } from "../errors/invalid-short-code.error";

export class ShortCode {
  /** Shared with the generator so both agree on the alphabet. */
  static readonly ALPHABET =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  // 62^7 ~ 3.5 trillion codes: collisions stay rare and are handled by retrying.
  static readonly LENGTH = 7;

  /**
   * Trusted instantiation: does NOT validate. Used for rehydration and lookups,
   * where an unknown code simply resolves to nothing. Use `create` for newly generated codes.
   */
  constructor(readonly value: string) {}

  // Validation lives in `create`, not the constructor: stored links must keep
  // resolving even if these rules get stricter later.
  static create(raw: string): ShortCode {
    if (!/^[0-9A-Za-z]{7}$/.test(raw)) {
      throw new InvalidShortCodeError("must be exactly 7 base62 characters (A-Z, a-z, 0-9)");
    }
    return new ShortCode(raw);
  }

  equals(other: ShortCode): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
