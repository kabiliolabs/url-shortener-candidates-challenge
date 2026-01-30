export class Url {
  readonly #value: string;

  constructor(value: string) {
    if (!Url.isValid(value)) {
      throw new Error(`Invalid URL: ${value}`);
    }
    this.#value = value;
  }

  static isValid(value: string): boolean {
    try {
      new globalThis.URL(value);
      return true;
    } catch {
      return false;
    }
  }

  equals(other: Url): boolean {
    return this.#value === other.#value;
  }

  toString(): string {
    return this.#value;
  }

  get value(): string {
    return this.#value;
  }
}