import type { ShortCode } from "../short-link/short-code";
import { DomainError } from "./domain-error";

/** Thrown by repositories on a unique-code collision so the use case can retry with a new code. */
export class ShortCodeAlreadyExistsError extends DomainError {
  constructor(readonly code: ShortCode) {
    super(`Short code "${code.value}" already exists`);
  }
}
