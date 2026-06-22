/**
 * Builds the baseline security headers for an HTML response.
 *
 * The CSP embeds a per-request `nonce` so React Router's inline hydration
 * scripts are allowed without `'unsafe-inline'` (which would defeat the script
 * XSS protection). Style allowances cover the Google Fonts <link> in root.tsx.
 *
 * - X-Content-Type-Options: stop MIME sniffing.
 * - X-Frame-Options + frame-ancestors: forbid framing (clickjacking defense).
 * - Referrer-Policy: send only the origin to destinations (privacy) WITHOUT
 *   using `no-referrer`, which per the Fetch spec forces `Origin: null` on
 *   non-GET requests and would trip React Router's same-origin action check.
 *
 * @param nonce - The per-request nonce, also passed to <Scripts nonce>.
 */
export function securityHeaders(nonce: string): Record<string, string> {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Content-Security-Policy": [
      "default-src 'self'",
      "img-src 'self' data:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      `script-src 'self' 'nonce-${nonce}'`,
      "base-uri 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  };
}
