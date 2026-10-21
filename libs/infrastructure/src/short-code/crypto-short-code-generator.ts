import { randomInt } from "node:crypto";
import { ShortCode, type ShortCodeGenerator } from "@url-shortener/engine";

/**
 * Random base62 codes from a crypto-safe source (SPEC-003), so codes can't be guessed.
 * randomInt() avoids the modulo bias you'd get from doing `randomBytes()[i] % 62`.
 */
export class CryptoShortCodeGenerator implements ShortCodeGenerator {
  generate(): ShortCode {
    const { ALPHABET, LENGTH } = ShortCode;
    let code = "";
    for (let i = 0; i < LENGTH; i++) {
      code += ALPHABET[randomInt(ALPHABET.length)];
    }
    return ShortCode.create(code);
  }
}
