import { randomBytes } from "crypto";
import { InvalidShortCodeError } from "./invalid-short-code-error";

const ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const CODE_LENGTH = 7;
// Reject bytes >= this threshold to eliminate modular bias (256 % 62 = 8 wasted values)
const MAX_VALID_BYTE = Math.floor(256 / ALPHABET.length) * ALPHABET.length;

export class ShortCode {
  private constructor(readonly value: string) {}

  static generate(): ShortCode {
    let code = "";
    while (code.length < CODE_LENGTH) {
      const bytes = randomBytes((CODE_LENGTH - code.length) * 2);
      for (let i = 0; i < bytes.length && code.length < CODE_LENGTH; i++) {
        if (bytes[i] < MAX_VALID_BYTE) code += ALPHABET[bytes[i] % ALPHABET.length];
      }
    }
    return new ShortCode(code);
  }

  static from(raw: string): ShortCode {
    if (!raw || raw.trim().length === 0) {
      throw new InvalidShortCodeError();
    }
    return new ShortCode(raw.trim());
  }

  toString(): string {
    return this.value;
  }
}
