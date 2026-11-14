import { URL } from "../../../shared/value-objects/url";
import { Err, Ok } from "../../../shared/types/result";
import type { Result } from "../../../shared/types/result";

export type ShortenedURLValidationError = {
  code: "required" | "invalid_url" | "unsupported_protocol";
  message: string;
};

const invalidDestination = (): Result<never, ShortenedURLValidationError> =>
  Err({
    code: "invalid_url",
    message: "Enter a complete, valid URL starting with http:// or https://.",
  });

export class ShortenedURL {
  private constructor(
    public readonly code: string,
    public readonly destination: URL,
  ) {
    Object.freeze(this);
  }

  static parseDestination(
    input: string,
  ): Result<URL, ShortenedURLValidationError> {
    // Preserve unsupported-protocol feedback even when that URL is malformed.
    const scheme = /^([a-z][a-z\d+.-]*):/i.exec(input.trim())?.[1];
    if (scheme) {
      const protocol = this.validateProtocol(`${scheme.toLowerCase()}:`);
      if (!protocol.ok) return protocol;
    }

    const destination = URL.safeParse(input);
    if (!destination.ok) {
      return destination.error.code === "required"
        ? destination
        : invalidDestination();
    }
    return this.validateDestination(destination.value);
  }

  static validateDestination(
    destination: URL,
  ): Result<URL, ShortenedURLValidationError> {
    const protocol = this.validateProtocol(destination.protocol);
    if (!protocol.ok) return protocol;

    // Native parsing can repair HTTP strings; shortening still requires // and an authority.
    if (!/^https?:\/\/[^\s/\\?#]+(?:[/?#]|$)/i.test(destination.value)) {
      return invalidDestination();
    }
    return Ok(destination);
  }

  static create(
    code: string,
    destination: URL,
  ): Result<ShortenedURL, ShortenedURLValidationError> {
    // Recheck here so direct callers cannot bypass the aggregate's invariant.
    const validated = this.validateDestination(destination);
    if (!validated.ok) return validated;
    return Ok(new ShortenedURL(code, validated.value));
  }

  private static validateProtocol(
    protocol: string,
  ): Result<void, ShortenedURLValidationError> {
    return protocol === "http:" || protocol === "https:"
      ? Ok(undefined)
      : Err({
          code: "unsupported_protocol",
          message: "Only http:// and https:// URLs are supported.",
        });
  }
}
