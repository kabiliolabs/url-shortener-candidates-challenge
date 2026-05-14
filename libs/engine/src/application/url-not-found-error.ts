import { ApplicationError } from "./application-error";

export class UrlNotFoundError extends ApplicationError {
  constructor(code: string) {
    super(`URL with code "${code}" not found`);
  }
}
