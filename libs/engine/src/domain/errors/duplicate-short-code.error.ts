import { DomainError } from "./domain-error";

export class DuplicateShortCodeError extends DomainError {
  readonly shortCode: string;

  constructor(shortCode: string) {
    super(`Short code "${shortCode}" is already in use`);
    this.shortCode = shortCode;
  }
}
