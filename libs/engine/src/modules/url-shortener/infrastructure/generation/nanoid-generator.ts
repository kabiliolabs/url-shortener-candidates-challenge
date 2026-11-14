import { customAlphabet } from "nanoid";
import type { ShortCodeGenerator } from "../../application/ports/short-code-generator";

const generateCode = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  10,
);

export class NanoIDShortCodeGenerator implements ShortCodeGenerator {
  generate(): string {
    return generateCode();
  }
}
