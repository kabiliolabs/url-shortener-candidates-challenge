/**
 * Maps raw API/backend errors to user-friendly messages.
 * Message text lives in server/constants (SHORTEN_ERROR_MESSAGES, API_ERROR_MESSAGES).
 */

import {
  SHORTEN_ERROR_MESSAGES,
  API_ERROR_MESSAGES,
} from "../server/constants.js";

export function getShortenErrorMessage(rawMessage: string, status?: number): string {
  const lower = rawMessage.toLowerCase();

  if (lower.includes("url is required") || lower.includes("missing 'url'") || lower.includes("url cannot be empty")) {
    return SHORTEN_ERROR_MESSAGES.URL_REQUIRED;
  }

  if (lower.includes("invalid url") && lower.includes("http")) {
    return SHORTEN_ERROR_MESSAGES.URL_INVALID_HTTP;
  }

  if (lower.includes("url must be at most") || lower.includes("too long")) {
    return SHORTEN_ERROR_MESSAGES.URL_TOO_LONG;
  }

  if (lower.includes("invalid json") || lower.includes("request body must be")) {
    return SHORTEN_ERROR_MESSAGES.INVALID_JSON;
  }

  if (lower.includes("could not build shortened url") || lower.includes("missing base url")) {
    return SHORTEN_ERROR_MESSAGES.COULD_NOT_BUILD_SHORT_LINK;
  }

  if (
    lower.includes("failed to generate unique short code") ||
    lower.includes("short code collision") ||
    lower.includes("conflict")
  ) {
    return SHORTEN_ERROR_MESSAGES.UNIQUE_SHORT_LINK_FAILED;
  }

  if (lower.includes("can't reach") || lower.includes("database") || lower.includes("prisma") || lower.includes("p1001") || lower.includes("p2025")) {
    return SHORTEN_ERROR_MESSAGES.DATABASE_UNAVAILABLE;
  }

  if (status === 500 || lower.includes("request failed: 500") || lower === "request failed: 500") {
    return SHORTEN_ERROR_MESSAGES.SERVER_ERROR_500;
  }

  if (status === 400 || lower.includes("request failed: 400")) {
    return SHORTEN_ERROR_MESSAGES.BAD_REQUEST_400;
  }

  return SHORTEN_ERROR_MESSAGES.GENERIC_FALLBACK(rawMessage);
}

export function getCopyErrorMessage(): string {
  return API_ERROR_MESSAGES.COPY_DENIED;
}

export function getEmptyResultMessage(): string {
  return API_ERROR_MESSAGES.EMPTY_RESULT;
}

export function getListUrlsErrorMessage(rawMessage: string): string {
  const lower = rawMessage.toLowerCase();
  if (lower.includes("failed to load") || lower.includes("request failed") || lower.includes("fetch")) {
    return API_ERROR_MESSAGES.LIST_LOAD_FAILED;
  }
  if (lower.includes("database") || lower.includes("500")) {
    return API_ERROR_MESSAGES.LIST_SERVER_ERROR;
  }
  return API_ERROR_MESSAGES.LIST_FALLBACK(rawMessage);
}
