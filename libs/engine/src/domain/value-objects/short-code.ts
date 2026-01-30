export class ShortCode {
  readonly #value: string;
  static readonly CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  static readonly MIN_LENGTH = 6;
  static readonly MAX_LENGTH = 8;

  constructor(value: string) {
    if (!ShortCode.isValid(value)) {
      throw new Error(`Invalid short code: ${value}`);
    }
    this.#value = value;
  }

  static isValid(value: string): boolean {
    return value.length >= ShortCode.MIN_LENGTH &&
           value.length <= ShortCode.MAX_LENGTH &&
           /^[a-zA-Z0-9]+$/.test(value);
  }

  equals(other: ShortCode): boolean {
    return this.#value === other.#value;
  }

  toString(): string {
    return this.#value;
  }

  get value(): string {
    return this.#value;
  }
}