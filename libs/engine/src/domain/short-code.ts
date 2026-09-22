import { randomInt } from "node:crypto";

const ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

// 62^7 ≈ 3.5e12 combinations keeps collisions rare enough that a few retries suffice.
const SHORT_CODE_LENGTH = 7;

const SHORT_CODE_PATTERN = new RegExp(`^[0-9A-Za-z]{${SHORT_CODE_LENGTH}}$`);

export function generateShortCode(): string {
  let code = "";
  for (let i = 0; i < SHORT_CODE_LENGTH; i++) {
    code += ALPHABET[randomInt(ALPHABET.length)];
  }
  return code;
}

export function isValidShortCode(code: string): boolean {
  return SHORT_CODE_PATTERN.test(code);
}
