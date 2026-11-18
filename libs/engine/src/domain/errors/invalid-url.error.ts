import { DomainError } from "./domain-error";

export class InvalidUrlError extends DomainError {
  readonly issues: readonly string[];

  constructor(message: string, issues: readonly string[] = []) {
    super(message);
    this.issues = issues;
  }
}
