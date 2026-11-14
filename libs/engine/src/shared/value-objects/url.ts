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
  private readonly parsedProtocol: string;

  private constructor(public readonly value: string) {
    this.parsedProtocol = new globalThis.URL(value).protocol;
    Object.freeze(this);
  }

  get protocol(): string {
    return this.parsedProtocol;
  }

  static safeParse(input: string): Result<URL, URLValidationError> {
    const value = input.trim();
    if (!value) return Err({ code: "required", message: "URL is required" });

    try {
      return Ok(new URL(value));
    } catch {
      return invalidURL();
    }
  }

  equals(other: URL): boolean {
    return this.value === other.value;
  }
}
