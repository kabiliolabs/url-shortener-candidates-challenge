import { DomainError } from "../domain/errors";

// These aren't business rules but application-level failures. They extend DomainError anyway
// so adapters can handle every expected error the same way (by `code`).

export class RateLimitExceededError extends DomainError {
  readonly code = "RATE_LIMIT_EXCEEDED";

  constructor(readonly retryAfterSeconds: number) {
    super(`Too many requests. Try again in ${retryAfterSeconds} seconds.`);
  }
}

export class ShortCodeCollisionError extends DomainError {
  readonly code = "SHORT_CODE_COLLISION";

  constructor(attempts: number) {
    super(`Couldn't generate a unique short code after ${attempts} attempts`);
  }
}
