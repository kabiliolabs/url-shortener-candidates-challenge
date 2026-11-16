import { randomInt } from "node:crypto";
import type { CodeGenerator } from "../domain/code-generator";

const ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const CODE_LENGTH = 7;

export class Base62CodeGenerator implements CodeGenerator {
  generate(): string {
    let code = "";
    for (let i = 0; i < CODE_LENGTH; i++) {
      code += ALPHABET[randomInt(ALPHABET.length)];
    }
    return code;
  }
}
