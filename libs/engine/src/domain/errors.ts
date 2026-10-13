export class InvalidDestinationUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidDestinationUrlError";
  }
}

export class InvalidShortCodeError extends Error {
  constructor() {
    super("Short code must contain exactly 8 URL-safe characters.");
    this.name = "InvalidShortCodeError";
  }
}

export class ShortCodeAlreadyExistsError extends Error {
  constructor(readonly code: string) {
    super(`Short code already exists: ${code}`);
    this.name = "ShortCodeAlreadyExistsError";
  }
}

export class ShortCodeGenerationExhaustedError extends Error {
  constructor() {
    super("Could not generate a unique short code.");
    this.name = "ShortCodeGenerationExhaustedError";
  }
}

export class ShortUrlNotFoundError extends Error {
  constructor(readonly code: string) {
    super(`Short URL was not found: ${code}`);
    this.name = "ShortUrlNotFoundError";
  }
}
