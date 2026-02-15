import { ValidationError } from "../errors.js";
import { URL_MAX_LENGTH, SERVER_MESSAGES } from "../constants.js";

export function isValidHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeStringInput(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function validateUrlInput(trimmed: string): void {
  if (!trimmed) throw new ValidationError(SERVER_MESSAGES.URL_REQUIRED);
  if (trimmed.length > URL_MAX_LENGTH) {
    throw new ValidationError(SERVER_MESSAGES.URL_TOO_LONG(URL_MAX_LENGTH));
  }
  if (!isValidHttpUrl(trimmed)) throw new ValidationError(SERVER_MESSAGES.URL_INVALID);
}
