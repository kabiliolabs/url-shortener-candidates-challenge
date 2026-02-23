import { customAlphabet } from "nanoid";
import type { IdGeneratorPort } from "../../application/ports/id-generator.port";

const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-";

export class NanoIdGenerator implements IdGeneratorPort {
  generate(length: number): string {
    const generator = customAlphabet(alphabet, length);
    return generator();
  }
}
