import { nanoid } from "nanoid";

export const SHORT_CODE_LENGTH = 8;

export function generateShortCode(): string {
  return nanoid(SHORT_CODE_LENGTH);
}
