import { DomainError, RateLimitExceededError } from "@url-shortener/engine";
import { env } from "./env";

const STATUS_BY_CODE: Record<string, number> = {
  INVALID_URL: 400,
  SHORT_URL_NOT_FOUND: 404,
  RATE_LIMIT_EXCEEDED: 429,
};

export interface HttpError {
  status: number;
  message: string;
  headers?: HeadersInit;
}

/**
 * Turns whatever a use case threw into something safe to show the user.
 * Expected errors keep their message; anything else is logged and hidden (SPEC-008).
 */
export function toHttpError(error: unknown): HttpError {
  if (error instanceof DomainError && error.code in STATUS_BY_CODE) {
    const headers =
      error instanceof RateLimitExceededError
        ? { "Retry-After": String(error.retryAfterSeconds) }
        : undefined;
    return { status: STATUS_BY_CODE[error.code], message: error.message, headers };
  }

  console.error(error);
  return { status: 500, message: "Something went wrong on our side. Please try again in a moment." };
}

/**
 * Rate limit key. X-Forwarded-For is trivial to fake, so we only trust it behind our own proxy.
 * Without one, react-router-serve doesn't expose the socket IP, so everyone shares one bucket.
 */
export function getClientId(request: Request): string {
  if (env.trustProxy) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    if (ip) return ip;
  }
  return "anonymous";
}
