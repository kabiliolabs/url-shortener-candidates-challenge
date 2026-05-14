import { ApplicationError } from "./application-error";

export class RateLimitExceededError extends ApplicationError {
  constructor() {
    super("Too many requests. Please try again later.");
  }
}
