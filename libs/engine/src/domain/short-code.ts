const ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const CODE_LENGTH = 7;

export class ShortCode {
  private constructor(readonly value: string) {}

  static generate(): ShortCode {
    let code = "";
    for (let i = 0; i < CODE_LENGTH; i++) {
      code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    }
    return new ShortCode(code);
  }

  static from(raw: string): ShortCode {
    if (!raw || raw.trim().length === 0) {
      throw new Error("Short code cannot be empty");
    }
    return new ShortCode(raw.trim());
  }

  toString(): string {
    return this.value;
  }
}
