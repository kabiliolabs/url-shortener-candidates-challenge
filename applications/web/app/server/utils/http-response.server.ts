/**
 * Helpers for consistent JSON API responses. Server-only.
 */

export const JSON_HEADERS = {
  "Content-Type": "application/json",
} as const;

export const httpResponse = {
  ok<T extends Record<string, unknown>>(body: T): Response {
    return Response.json(body, { status: 200, headers: JSON_HEADERS });
  },
  error(message: string, status: 400 | 405 | 500 = 500): Response {
    return Response.json({ error: message }, { status, headers: JSON_HEADERS });
  },
  methodNotAllowed(): Response {
    return this.error("Method not allowed", 405);
  },
} as const;
