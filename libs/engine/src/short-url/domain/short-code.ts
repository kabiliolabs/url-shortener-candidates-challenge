import { ShortUrlError } from "../errors";

export type ShortCode = string & { readonly __brand: "ShortCode" };

const SHORT_CODE_PATTERN = /^[A-Za-z0-9_-]{4,32}$/;

export function createShortCode(value: string): ShortCode {
  const candidate = value.trim();

  if (!SHORT_CODE_PATTERN.test(candidate)) {
    throw new ShortUrlError("invalid_short_code", "Short code is invalid");
  }

  return candidate as ShortCode;
}
