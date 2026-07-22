const MAX_LIST_LIMIT = 100;

export function parseDestinationUrl(body: unknown): string {
  if (!body || typeof body !== "object" || !("url" in body) || typeof body.url !== "string") {
    return "";
  }

  return body.url;
}

export function parseListLimit(value: unknown): number {
  const requestedLimit = Number(value ?? 50);
  return Number.isInteger(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), MAX_LIST_LIMIT)
    : 50;
}
