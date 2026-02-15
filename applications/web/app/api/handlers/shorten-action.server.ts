import { shortenUrl } from "../../services/shortened-url.server.js";
import { getShortenedBaseUrl } from "../../utils/server/get-base-url.server.js";
import { parseShortenBody, JSON_HEADERS } from "../../utils/server/parse-shorten-body.server.js";
import { toUserFacingDatabaseError } from "../../utils/server/database-error.server.js";

/**
 * Handles POST /api/shorten. Returns JSON Response. Server-only.
 */
export async function handleShortenAction(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405, headers: JSON_HEADERS });
  }

  const parsed = await parseShortenBody(request);
  if ("error" in parsed) return parsed.error;

  try {
    const { code } = await shortenUrl(parsed.url);
    const origin = getShortenedBaseUrl(request);
    const shortenedUrl = origin ? `${origin}/s/${code}` : "";
    if (!shortenedUrl) {
      return Response.json(
        { error: "Could not build shortened URL (missing base URL)" },
        { status: 500, headers: JSON_HEADERS }
      );
    }
    return Response.json({ shortenedUrl }, { status: 200, headers: JSON_HEADERS });
  } catch (e: unknown) {
    const rawMessage = e instanceof Error ? e.message : "Failed to shorten URL";
    const message = toUserFacingDatabaseError(rawMessage);
    const isValidationOrConflict =
      e instanceof Error && (e.name === "ValidationError" || e.name === "ConflictError");
    const status = isValidationOrConflict ? 400 : 500;
    return Response.json({ error: message }, { status, headers: JSON_HEADERS });
  }
}
