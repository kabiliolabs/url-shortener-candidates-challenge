import { ApplicationError } from "./application-error";

/** A short link must not point back to the shortener itself. */
export class SelfReferencingUrlError extends ApplicationError {
  constructor(readonly host: string) {
    super(`URLs pointing to "${host}" cannot be shortened`);
  }
}
