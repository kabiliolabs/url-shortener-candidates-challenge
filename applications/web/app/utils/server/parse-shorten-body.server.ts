const JSON_HEADERS = { "Content-Type": "application/json" } as const;

/**
 * Parses and validates the request body for POST /api/shorten.
 * Returns { url } or { error: Response }. Server-only.
 */
export async function parseShortenBody(
  request: Request
): Promise<{ url: string } | { error: Response }> {
  let body: unknown;
  try {
    body = await request.clone().json();
  } catch {
    return { error: Response.json({ error: "Invalid JSON in request body" }, { status: 400, headers: JSON_HEADERS }) };
  }

  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return {
      error: Response.json(
        { error: "Request body must be a JSON object with a 'url' field" },
        { status: 400, headers: JSON_HEADERS }
      ),
    };
  }

  const rawUrl = (body as Record<string, unknown>).url;
  const url = typeof rawUrl === "string" ? rawUrl.trim() : "";
  if (!url) {
    const message =
      rawUrl === undefined || rawUrl === null ? "Missing 'url' in request body" : "URL cannot be empty";
    return { error: Response.json({ error: message }, { status: 400, headers: JSON_HEADERS }) };
  }

  return { url };
}

export { JSON_HEADERS };
