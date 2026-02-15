import { randomBytes } from "node:crypto";
import {
  SHORT_CODE_ALPHABET,
  SHORT_CODE_LENGTH,
  MAX_CREATE_ATTEMPTS,
} from "../constants.js";

const BASE = SHORT_CODE_ALPHABET.length;
const UNBIASED_BYTE_MAX = 256 - (256 % BASE);

export function generateShortCode(): string {
  const bytes = randomBytes(SHORT_CODE_LENGTH);
  let code = "";
  for (let i = 0; i < SHORT_CODE_LENGTH; i++) {
    let n = bytes[i]!;
    while (n >= UNBIASED_BYTE_MAX) {
      const [next] = randomBytes(1);
      n = next!;
    }
    code += SHORT_CODE_ALPHABET[n % BASE];
  }
  return code;
}

export function isValidShortCodeFormat(code: string): boolean {
  if (!code || code.length !== SHORT_CODE_LENGTH) return false;
  const allowed = new Set(SHORT_CODE_ALPHABET);
  return [...code].every((char) => allowed.has(char));
}

export function isCodeValidForLookup(code: string): boolean {
  return !!code && isValidShortCodeFormat(code);
}

export { SHORT_CODE_LENGTH, SHORT_CODE_ALPHABET, MAX_CREATE_ATTEMPTS };
