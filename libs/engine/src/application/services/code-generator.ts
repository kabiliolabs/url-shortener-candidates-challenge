import { customAlphabet } from "nanoid";

const DEFAULT_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const DEFAULT_CODE_LENGTH = 8;
const DEFAULT_MAX_ATTEMPTS = 5;

export interface CodeGeneratorOptions {
  alphabet?: string;
  length?: number;
  maxAttempts?: number;
}

export class CodeGenerator {
  private readonly nanoId: () => string;
  private readonly maxAttempts: number;

  constructor({
    alphabet = DEFAULT_ALPHABET,
    length = DEFAULT_CODE_LENGTH,
    maxAttempts = DEFAULT_MAX_ATTEMPTS,
  }: CodeGeneratorOptions = {}) {
    if (length <= 0) {
      throw new Error("Code length must be greater than zero");
    }
    if (maxAttempts <= 0) {
      throw new Error("Max attempts must be greater than zero");
    }

    this.nanoId = customAlphabet(alphabet, length);
    this.maxAttempts = maxAttempts;
  }

  generate(): string {
    return this.nanoId();
  }

  async generateUnique(
    isTaken: (shortCode: string) => Promise<boolean>,
  ): Promise<string> {
    for (let attempt = 0; attempt < this.maxAttempts; attempt++) {
      const shortCode = this.generate();
      if (!(await isTaken(shortCode))) {
        return shortCode;
      }
    }

    throw new Error("Could not generate a unique short code. Please try again.");
  }
}
