import { DomainError } from "./domain-error";

export class InvalidShortCodeError extends DomainError {
  constructor() {
    super("Short code cannot be empty");
  }
}
