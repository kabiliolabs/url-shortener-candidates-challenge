import { httpResponse } from "./http-response.server.js";

export const SHORTEN_BODY_ERRORS = {
  INVALID_JSON: "Invalid JSON in request body",
  NOT_OBJECT: "Request body must be a JSON object with a 'url' field",
  MISSING_URL: "Missing 'url' in request body",
  EMPTY_URL: "URL cannot be empty",
} as const;

export async function parseShortenBody(
  request: Request
): Promise<{ url: string } | { error: Response }> {
  let body: unknown;
  try {
    body = await request.clone().json();
  } catch {
    return { error: httpResponse.error(SHORTEN_BODY_ERRORS.INVALID_JSON, 400) };
  }

  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { error: httpResponse.error(SHORTEN_BODY_ERRORS.NOT_OBJECT, 400) };
  }

  const rawUrl = (body as Record<string, unknown>).url;
  const url = typeof rawUrl === "string" ? rawUrl.trim() : "";
  if (!url) {
    const message =
      rawUrl === undefined || rawUrl === null
        ? SHORTEN_BODY_ERRORS.MISSING_URL
        : SHORTEN_BODY_ERRORS.EMPTY_URL;
    return { error: httpResponse.error(message, 400) };
  }

  return { url };
}
