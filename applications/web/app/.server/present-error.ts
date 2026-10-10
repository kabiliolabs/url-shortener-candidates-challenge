import { ApplicationError } from "@url-shortener/engine/application";
import { DomainError } from "@url-shortener/engine/domain";

export function toUserError(error: unknown): string | null {
  if (error instanceof DomainError || error instanceof ApplicationError) {
    return error.message;
  }
  return null;
}
