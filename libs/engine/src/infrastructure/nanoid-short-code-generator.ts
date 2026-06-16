import { customAlphabet } from "nanoid";
import type { ShortCodeGenerator } from "../domain/services/short-code-generator";

const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export class NanoIdShortCodeGenerator implements ShortCodeGenerator {
  private readonly generateCode = customAlphabet(alphabet, 8);

  generate(): string {
    return this.generateCode();
  }
}
