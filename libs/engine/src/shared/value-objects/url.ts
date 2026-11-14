import { Err, Ok } from "../types/result";
import type { Result } from "../types/result";

export type URLValidationError = {
  code: "required" | "invalid_url";
  message: string;
};

const invalidURL = (): Result<never, URLValidationError> =>
  Err({
    code: "invalid_url",
    message: "Enter a valid absolute URL.",
  });

export class URL {
  private constructor(
    public readonly value: string,
    private readonly parsedProtocol: string,
  ) {
    Object.freeze(this);
  }

  get protocol(): string {
    return this.parsedProtocol;
  }

  static safeParse(input: string): Result<URL, URLValidationError> {
    const value = input.trim();
    if (!value) return Err({ code: "required", message: "URL is required" });

    try {
      const parsed = new globalThis.URL(value);
      return Ok(new URL(value, parsed.protocol));
    } catch {
      return invalidURL();
    }
  }

  equals(other: URL): boolean {
    return this.value === other.value;
  }
}
