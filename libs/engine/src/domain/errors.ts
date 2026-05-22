export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvalidUrlError extends DomainError {
  constructor(public readonly reason: string) {
    super(`Invalid URL: ${reason}`);
  }
}

export class InvalidShortCodeError extends DomainError {
  constructor(public readonly reason: string) {
    super(`Invalid short code: ${reason}`);
  }
}

export class CodeNotFoundError extends DomainError {
  constructor(public readonly code: string) {
    super(`Short code not found: ${code}`);
  }
}

export class CodeCollisionError extends DomainError {
  constructor(public readonly code: string) {
    super(`Short code collision: ${code}`);
  }
}

export class RateLimitExceededError extends DomainError {
  constructor(public readonly retryAfterSeconds: number) {
    super(`Rate limit exceeded; retry after ${retryAfterSeconds}s`);
  }
}
