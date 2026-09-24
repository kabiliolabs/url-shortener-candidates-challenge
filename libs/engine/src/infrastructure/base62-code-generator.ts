import { randomInt } from "node:crypto";
import type { ShortCodeGenerator } from "../domain/short-code-generator";

const ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export class Base62CodeGenerator implements ShortCodeGenerator {
  private readonly length: number;

  constructor(length = 7) {
    this.length = length;
  }

  generate(): string {
    let code = "";
    for (let i = 0; i < this.length; i++) {
      code += ALPHABET[randomInt(ALPHABET.length)];
    }
    return code;
  }
}