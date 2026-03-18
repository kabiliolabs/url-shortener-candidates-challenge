import { ShortCode } from "../../domain/value-objects/short-code";
import type { IShortCodeGenerator } from "../../domain/services/short-code-generator";

export class RandomShortCodeGenerator implements IShortCodeGenerator {
  generate(): ShortCode {
    let code = "";
    for (let i = 0; i < ShortCode.LENGTH; i++) {
      code += ShortCode.ALPHABET[Math.floor(Math.random() * ShortCode.ALPHABET.length)];
    }
    return new ShortCode(code);
  }
}
