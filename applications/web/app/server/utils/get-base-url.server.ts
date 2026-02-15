import { baseUrl } from "@url-shortener/engine";

export function getShortenedBaseUrl(request: Request): string {
  if (baseUrl && baseUrl.trim()) return baseUrl.trim().replace(/\/$/, "");
  try {
    const u = new URL(request.url);
    if (u.protocol && u.host) return `${u.protocol}//${u.host}`;
  } catch {
    /* request.url may be relative on some servers */
  }
  const host = request.headers.get("Host") || request.headers.get("host");
  if (host) {
    const proto = request.headers.get("X-Forwarded-Proto")?.split(",")[0]?.trim() || "http";
    return `${proto === "https" ? "https" : "http"}://${host}`;
  }
  return "";
}
