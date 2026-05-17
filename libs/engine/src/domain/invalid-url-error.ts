import { DomainError } from "./domain-error";

export class InvalidUrlError extends DomainError {
  constructor(reason: string) {
    super(reason);
  }
}
