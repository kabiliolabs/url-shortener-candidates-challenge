import { ApplicationError } from "./application-error";

export class ShortCodeGenerationExhaustedError extends ApplicationError {
  constructor(readonly attempts: number, options?: ErrorOptions) {
    super(`Could not find an unused short code after ${attempts} attempts`, options);
  }
}
