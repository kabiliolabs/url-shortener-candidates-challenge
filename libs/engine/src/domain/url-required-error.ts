import { DomainError } from "./domain-error";

export class UrlRequiredError extends DomainError {
  constructor() {
    super("URL is required");
  }
}
