import { shortenUrl } from "../services/shortened-url.server.js";
import { getShortenedBaseUrl } from "../utils/get-base-url.server.js";
import { parseShortenBody } from "../utils/parse-shorten-body.server.js";
import { toUserFacingDatabaseError } from "../utils/database-error.server.js";
import { isClientError } from "../errors.js";
import { httpResponse } from "../utils/http-response.server.js";
import { SERVER_MESSAGES } from "../constants.js";
import { checkShortenRateLimit } from "../utils/rate-limit.server.js";

/**
 * Handles POST /api/shorten. Returns JSON Response. Server-only.
 */
export async function handleShortenAction(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return httpResponse.methodNotAllowed();
  }

  const rateLimitResult = checkShortenRateLimit(request);
  if (!rateLimitResult.allowed) {
    return httpResponse.error(rateLimitResult.message, 429);
  }

  const parsed = await parseShortenBody(request);
  if ("error" in parsed) return parsed.error;

  try {
    const { code } = await shortenUrl(parsed.url);
    const origin = getShortenedBaseUrl(request);
    const shortenedUrl = origin ? `${origin}/s/${code}` : "";
    if (!shortenedUrl) {
      return httpResponse.error(SERVER_MESSAGES.MISSING_BASE_URL, 500);
    }
    return httpResponse.ok({ shortenedUrl });
  } catch (e: unknown) {
    const rawMessage = e instanceof Error ? e.message : "Failed to shorten URL";
    const message = toUserFacingDatabaseError(rawMessage);
    const status = isClientError(e) ? 400 : 500;
    return httpResponse.error(message, status);
  }
}
