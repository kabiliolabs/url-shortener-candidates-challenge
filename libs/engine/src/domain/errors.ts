/**
 * Thrown when a user-supplied URL fails validation (malformed, disallowed
 * scheme, too long, or pointing at a private/internal host). The message is
 * safe to surface to the end user.
 */
export class InvalidUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidUrlError";
  }
}

/**
 * Thrown by a {@link UrlRepository} implementation when the chosen short code
 * already exists (a unique-constraint violation). The {@link UrlShortener}
 * catches this and retries with a freshly generated code.
 */
export class CodeCollisionError extends Error {
  constructor(public readonly code: string) {
    super(`Short code already exists: ${code}`);
    this.name = "CodeCollisionError";
  }
}

/**
 * Thrown when the shortener could not find a free code within the allowed
 * number of attempts. In practice this should be astronomically rare and
 * usually signals the keyspace is saturated or the code length is too small.
 */
export class RetryExhaustedError extends Error {
  constructor(public readonly attempts: number) {
    super(`Could not generate a unique short code after ${attempts} attempts`);
    this.name = "RetryExhaustedError";
  }
}
