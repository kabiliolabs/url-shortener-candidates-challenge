/**
 * Backend constants. Single source of truth for limits and Prisma codes.
 * Do not import in frontend code.
 */

export const URL_MAX_LENGTH = 2048;
export const SHORT_CODE_LENGTH = 6;
export const SHORT_CODE_ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
export const MAX_CREATE_ATTEMPTS = 10;
export const PRISMA_UNIQUE_VIOLATION = "P2002";
export const PRISMA_NOT_FOUND = "P2025";

export const SERVER_MESSAGES = {
  URL_REQUIRED: "URL is required",
  URL_INVALID: "Invalid URL: must be http or https",
  URL_TOO_LONG: (max: number) => `URL must be at most ${max} characters`,
  /** Used when short-code collision retries are exhausted (unique constraint). */
  CODE_GENERATION_FAILED: "Failed to generate unique short code",
  /** User-facing message for API when collision occurs. */
  SHORT_CODE_COLLISION: "Short code collision: could not generate a unique link. Please try again.",
} as const;
