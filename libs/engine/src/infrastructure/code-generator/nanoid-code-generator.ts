import { customAlphabet } from "nanoid";
import type { CodeGenerator } from "../../domain/ports/code-generator";
import { ShortCode } from "../../domain/short-code";

// URL-safe alphanumeric alphabet (62 chars, no `_-` for prettier URLs).
const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const nanoid = customAlphabet(ALPHABET, ShortCode.LENGTH);

export class NanoidCodeGenerator implements CodeGenerator {
  generate(): ShortCode {
    return ShortCode.fromTrusted(nanoid());
  }
}
