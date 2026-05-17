import { DomainError } from "./domain-error";

export class ShortCodeCollisionError extends DomainError {
  constructor() {
    super("Short code collision");
  }
}
