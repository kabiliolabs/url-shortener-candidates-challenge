import { DomainError } from "./domain-error";

export class InvalidShortCodeError extends DomainError {
  constructor(readonly reason: string) {
    super(`Invalid short code: ${reason}`);
  }
}
