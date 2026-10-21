/**
 * Base class for business rule violations. The `code` lets adapters (like the web app)
 * map errors to responses without relying on instanceof across package boundaries.
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export type InvalidUrlReason =
  | "required"
  | "too_long"
  | "malformed"
  | "unsupported_scheme"
  | "own_domain";

export class InvalidUrlError extends DomainError {
  readonly code = "INVALID_URL";

  private constructor(
    readonly reason: InvalidUrlReason,
    message: string,
  ) {
    super(message);
  }

  static required() {
    return new InvalidUrlError("required", "URL is required");
  }

  static tooLong(max: number) {
    return new InvalidUrlError("too_long", `URL is too long (max ${max} characters)`);
  }

  static malformed() {
    return new InvalidUrlError("malformed", "Please enter a valid URL");
  }

  static unsupportedScheme() {
    return new InvalidUrlError("unsupported_scheme", "Only http and https URLs are allowed");
  }

  static ownDomain() {
    return new InvalidUrlError("own_domain", "You can't shorten a link from this service");
  }
}

export class InvalidShortCodeError extends DomainError {
  readonly code = "INVALID_SHORT_CODE";

  constructor(value: string) {
    super(`"${value}" is not a valid short code`);
  }
}

export class ShortUrlNotFoundError extends DomainError {
  readonly code = "SHORT_URL_NOT_FOUND";

  constructor(code: string) {
    super(`No short URL found for "${code}"`);
  }
}

/** Thrown by repositories when the code is already taken (unique constraint). */
export class ShortCodeAlreadyExistsError extends DomainError {
  readonly code = "SHORT_CODE_ALREADY_EXISTS";

  constructor(code: string) {
    super(`Short code "${code}" already exists`);
  }
}
