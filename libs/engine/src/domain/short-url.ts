export interface ShortUrl {
  id: string;
  code: string;
  originalUrl: string;
  clickCount: number;
  lastClickedAt: Date | null;
  createdAt: Date;
}

const BASE62_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const SHORT_CODE_LENGTH = 7;

/** Pure, stateless: produces one random base62 candidate. Uniqueness is enforced
 * by the database's UNIQUE constraint on `code`, not by this function. */
export function generateShortCode(): string {
  let code = "";
  for (let i = 0; i < SHORT_CODE_LENGTH; i++) {
    code += BASE62_ALPHABET[Math.floor(Math.random() * BASE62_ALPHABET.length)];
  }
  return code;
}
