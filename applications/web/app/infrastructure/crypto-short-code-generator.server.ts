import { randomBytes } from "node:crypto";
import type { ShortCodeGenerator } from "@url-shortener/engine";

export class CryptoShortCodeGenerator implements ShortCodeGenerator {
  generate(): string {
    return randomBytes(6).toString("base64url").slice(0, 8);
  }
}
