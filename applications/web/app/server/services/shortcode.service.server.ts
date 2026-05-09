import { customAlphabet } from "nanoid";

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const CODE_LENGTH = 10;

const generate = customAlphabet(ALPHABET, CODE_LENGTH);

export function generateShortCode(): string {
  return generate();
}

export { ALPHABET, CODE_LENGTH };
