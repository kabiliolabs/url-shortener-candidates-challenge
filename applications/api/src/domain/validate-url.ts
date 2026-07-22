import { ValidationError } from "./errors.js";

const MAX_URL_LENGTH = 2_048;

export function validateDestinationUrl(value: unknown): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ValidationError("A destination URL is required");
  }

  if (value.length > MAX_URL_LENGTH) {
    throw new ValidationError(`URL must not exceed ${MAX_URL_LENGTH} characters`);
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(value);
  } catch {
    throw new ValidationError("URL must be a valid absolute URL");
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new ValidationError("Only HTTP and HTTPS URLs are allowed");
  }

  if (parsedUrl.username || parsedUrl.password) {
    throw new ValidationError("URLs containing credentials are not allowed");
  }

  return parsedUrl.toString();
}
