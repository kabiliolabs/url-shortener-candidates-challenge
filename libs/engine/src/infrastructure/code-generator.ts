import { customAlphabet } from "nanoid";
import { BASE62_ALPHABET } from "../domain/value-objects/short-code";
import type { CodeGenerator } from "../domain/ports/code-generator";

/** Default code length. 62^7 ≈ 3.5e12 combinations — collisions are rare. */
export const DEFAULT_CODE_LENGTH = 7;

export function createCodeGenerator(
  length: number = DEFAULT_CODE_LENGTH,
): CodeGenerator {
  const nanoid = customAlphabet(BASE62_ALPHABET, length);
  return {
    generate: () => nanoid(),
  };
}
