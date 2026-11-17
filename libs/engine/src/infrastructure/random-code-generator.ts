import { randomInt } from "node:crypto";
import type { ShortCodeGenerator } from "../domain/short-code-generator";

const ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

// 62^7 is about 3.5 trillion codes: short enough to share, large enough that
// collisions are rare and valid codes cannot be found by guessing.
const LENGTH = 7;

export class RandomCodeGenerator implements ShortCodeGenerator {
  generate(): string {
    let code = "";
    for (let i = 0; i < LENGTH; i++) {
      // randomInt is cryptographically secure and unbiased, unlike
      // Math.random, so existing codes cannot be predicted from new ones.
      code += ALPHABET[randomInt(ALPHABET.length)];
    }
    return code;
  }
}
