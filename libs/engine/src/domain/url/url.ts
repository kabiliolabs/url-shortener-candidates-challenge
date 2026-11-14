import { Err, Ok } from "../../types/result";
import type { Result } from "../../types/result";

export type URLValidationError = {
  code: "required" | "invalid_url" | "unsupported_protocol";
  message: string;
};

const invalidURL = (): Result<never, URLValidationError> =>
  Err({
    code: "invalid_url",
    message: "Enter a complete, valid URL starting with http:// or https://.",
  });

export class URL {
  private constructor(public readonly value: string) {
    Object.freeze(this);
  }

  static safeParse(input: string): Result<URL, URLValidationError> {
    const value = input.trim();
    if (!value) return Err({ code: "required", message: "URL is required" });

    const scheme = /^([a-z][a-z\d+.-]*):/i.exec(value)?.[1].toLowerCase();
    if (scheme && scheme !== "http" && scheme !== "https") {
      return Err({
        code: "unsupported_protocol",
        message: "Only http:// and https:// URLs are supported.",
      });
    }

    if (!/^https?:\/\/[^\s/\\?#]+(?:[/?#]|$)/i.test(value)) return invalidURL();

    try {
      const parsed = new globalThis.URL(value);
      if (!parsed.hostname) return invalidURL();
    } catch {
      return invalidURL();
    }

    return Ok(new URL(value));
  }

  equals(other: URL): boolean {
    return this.value === other.value;
  }
}
