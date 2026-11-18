import { DomainError } from "./domain-error";

export class UrlNotFoundError extends DomainError {
  readonly shortCode: string;

  constructor(shortCode: string) {
    super(`No active URL found for short code "${shortCode}"`);
    this.shortCode = shortCode;
  }
}
