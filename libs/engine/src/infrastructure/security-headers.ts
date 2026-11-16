import { frontendOrigin } from "./config";

// shortcut: no Content-Security-Policy yet; React Router's inline hydration scripts need a per-request nonce first.
const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=15552000; includeSubDomains",
  "Cross-Origin-Opener-Policy": "same-origin",
  "X-DNS-Prefetch-Control": "off",
};

export function applySecurityHeaders(
  headers: Headers,
  request: Request,
  allowedOrigin = frontendOrigin,
): void {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, value);
  }

  headers.append("Vary", "Origin");
  const origin = request.headers.get("Origin");
  if (origin && origin === allowedOrigin) {
    headers.set("Access-Control-Allow-Origin", origin);
  }
}

export function withSecurityHeaders(
  response: Response,
  request: Request,
  allowedOrigin = frontendOrigin,
): Response {
  applySecurityHeaders(response.headers, request, allowedOrigin);
  return response;
}
