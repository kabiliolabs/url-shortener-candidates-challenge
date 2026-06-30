import { InvalidShortCodeError } from "../errors";

// Single source of truth for what a valid short code is made of: the code
// generator builds codes from it, and the validation below is derived from it.
export const BASE62_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const BASE62_CODE = new RegExp(`^[${BASE62_ALPHABET}]+$`);
const MAX_CODE_LENGTH = 64;

export class ShortCode {
  private constructor(public readonly value: string) {}

  static create(raw: string): ShortCode {
    if (!raw || raw.length > MAX_CODE_LENGTH || !BASE62_CODE.test(raw)) {
      throw new InvalidShortCodeError(raw);
    }

    return new ShortCode(raw);
  }

  toString(): string {
    return this.value;
  }
}
