export class AppError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(code: string) {
    super(`Short URL not found: ${code}`, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor() {
    super('Could not generate a unique short code', 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  constructor() {
    super('Too many requests', 'RATE_LIMIT');
  }
}
