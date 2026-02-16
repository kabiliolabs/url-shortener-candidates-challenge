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

/** User-facing messages for shorten API errors (used by frontend getShortenErrorMessage). */
export const SHORTEN_ERROR_MESSAGES = {
  URL_REQUIRED:
    "You didn't enter a URL. Please enter the full web address you want to shorten (e.g. https://example.com or example.com).",
  URL_INVALID_HTTP:
    "This address isn't valid. The app only accepts links that start with http:// or https://. Please enter a full web address (e.g. https://example.com).",
  URL_TOO_LONG:
    "The URL is too long. Please use a link that is 2,048 characters or less.",
  INVALID_JSON:
    "Something went wrong sending your request. Please try again.",
  COULD_NOT_BUILD_SHORT_LINK:
    "The app couldn't generate a short link right now. Please try again in a moment.",
  UNIQUE_SHORT_LINK_FAILED:
    "The app couldn't create a unique short link. Please try again.",
  DATABASE_UNAVAILABLE:
    "The app is temporarily unable to save links. Please try again later.",
  SERVER_ERROR_500:
    "Something went wrong on our side. Please try again. If it keeps happening, try again later.",
  BAD_REQUEST_400:
    "Your request couldn't be processed. Please check that you entered a valid URL (e.g. https://example.com) and try again.",
  GENERIC_FALLBACK: (raw: string) =>
    `Something went wrong: ${raw}. Please check your URL (it should start with http:// or https://) and try again.`,
} as const;

/** User-facing messages for copy / empty result / list errors (used by frontend). */
export const API_ERROR_MESSAGES = {
  COPY_DENIED:
    "Your browser didn't allow copying. You can select and copy the shortened URL from the box above.",
  EMPTY_RESULT:
    "The server didn't return a short link. Please try again.",
  LIST_LOAD_FAILED:
    "We couldn't load the list of shortened URLs. Please check your connection and try again.",
  LIST_SERVER_ERROR:
    "The app is temporarily unable to load the list. Please try again later.",
  LIST_FALLBACK: (raw: string) =>
    `We couldn't load the list: ${raw}. Please try again.`,
} as const;
