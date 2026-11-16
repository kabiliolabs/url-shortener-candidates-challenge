import {
  CodeGenerationError,
  InvalidUrlError,
  ShortUrlNotFoundError,
} from "../domain/errors";
import { RateLimitExceededError } from "./rate-limiter";
import { PayloadTooLargeError } from "./request-body";

interface ErrorBody {
  status: number;
  code: string;
  message: string;
  headers?: Record<string, string>;
}

function toErrorBody(error: unknown): ErrorBody {
  if (error instanceof RateLimitExceededError) {
    return {
      status: 429,
      code: "RATE_LIMITED",
      message: error.message,
      headers: { "Retry-After": String(error.retryAfterSeconds) },
    };
  }

  if (error instanceof PayloadTooLargeError) {
    return { status: 413, code: "PAYLOAD_TOO_LARGE", message: error.message };
  }

  if (error instanceof InvalidUrlError) {
    return { status: 400, code: "INVALID_URL", message: error.message };
  }

  if (error instanceof ShortUrlNotFoundError) {
    return {
      status: 404,
      code: "SHORT_URL_NOT_FOUND",
      message: error.message,
    };
  }

  if (error instanceof CodeGenerationError) {
    return {
      status: 409,
      code: "CODE_GENERATION_CONFLICT",
      message: error.message,
    };
  }

  return {
    status: 500,
    code: "INTERNAL_ERROR",
    message: "An unexpected error occurred.",
  };
}

export function toErrorResponse(error: unknown): Response {
  const { status, code, message, headers } = toErrorBody(error);

  return new Response(JSON.stringify({ error: { code, message } }), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}
