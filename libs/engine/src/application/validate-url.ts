import { z } from "zod";
import { InvalidUrlError } from "../domain/errors";

const MAX_URL_LENGTH = 2048;
const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

const urlSchema = z
  .string()
  .trim()
  .min(1, "URL is required")
  .max(MAX_URL_LENGTH, `URL must be at most ${MAX_URL_LENGTH} characters`);

/**
 * Validates and normalizes a user-supplied URL.
 * Only http(s) is allowed, which blocks javascript:, data:, file:, etc.
 */
export function validateUrl(input: unknown): string {
  const parsed = urlSchema.safeParse(input);
  if (!parsed.success) {
    throw new InvalidUrlError(parsed.error.issues[0].message);
  }

  let url: URL;
  try {
    url = new URL(parsed.data);
  } catch {
    throw new InvalidUrlError("Enter a valid URL, e.g. https://example.com");
  }

  if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
    throw new InvalidUrlError("Only http and https URLs are allowed");
  }

  return url.toString();
}