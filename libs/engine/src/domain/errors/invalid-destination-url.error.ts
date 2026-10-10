import { DomainError } from "./domain-error";

export class InvalidDestinationUrlError extends DomainError {
  constructor(readonly reason: string) {
    super(`Invalid destination URL: ${reason}`);
  }
}
