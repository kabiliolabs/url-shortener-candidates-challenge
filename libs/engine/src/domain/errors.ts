export class InvalidUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidUrlError";
  }
}

export class ShortCodeExhaustedError extends Error {
  constructor(message = "Could not generate a unique short code, please try again") {
    super(message);
    this.name = "ShortCodeExhaustedError";
  }
}

export class ShortUrlNotFoundError extends Error {
  constructor(code: string) {
    super(`No shortened URL found for code "${code}"`);
    this.name = "ShortUrlNotFoundError";
  }
}

/**
 * Internal signal: thrown by an IShortUrlRepository.create() implementation
 * when the generated code already exists (DB unique-constraint violation).
 * Caught only by ShortUrlService's retry loop - never expected to reach routes.
 */
export class ShortCodeCollisionError extends Error {
  constructor(code: string) {
    super(`Short code "${code}" is already in use`);
    this.name = "ShortCodeCollisionError";
  }
}
