import { randomInt } from "node:crypto";

export const shortenedUrls: Map<string, string> = new Map();

const SHORT_CODE_CHARS =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const SHORT_CODE_LENGTH = 6;

export function generateShortCode(): string {
  let code = "";
  for (let i = 0; i < SHORT_CODE_LENGTH; i++) {
    code += SHORT_CODE_CHARS[randomInt(SHORT_CODE_CHARS.length)];
  }
  return code;
}
