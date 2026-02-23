export class ApplicationError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message: string) {
    super(message, "NOT_FOUND");
  }
}

export class ConflictError extends ApplicationError {
  constructor(message: string) {
    super(message, "CONFLICT");
  }
}

export class RateLimitError extends ApplicationError {
  constructor(message: string) {
    super(message, "RATE_LIMIT");
  }
}
