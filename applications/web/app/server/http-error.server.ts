import {
  ApplicationError,
  NotFoundError,
  RateLimitError,
  ValidationError,
} from "@url-shortener/engine";

export function toHttpResponse(error: unknown): Response {
  if (error instanceof ValidationError) {
    return new Response(error.message, { status: 400 });
  }

  if (error instanceof RateLimitError) {
    return new Response(error.message, { status: 429 });
  }

  if (error instanceof NotFoundError) {
    return new Response(error.message, { status: 404 });
  }

  if (error instanceof ApplicationError) {
    return new Response(error.message, { status: 409 });
  }

  return new Response("Unexpected server error.", { status: 500 });
}
