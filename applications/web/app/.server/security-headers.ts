/**
 * Baseline security headers applied to every HTML response (see entry.server).
 *
 * - X-Content-Type-Options: stop MIME sniffing.
 * - X-Frame-Options: forbid framing (clickjacking defense).
 * - Referrer-Policy: don't leak the shortener URL to destinations.
 * - Content-Security-Policy: restrict where scripts/styles/fonts can load from.
 *   The style/font allowances cover the Google Fonts <link> used in root.tsx.
 */
export const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Content-Security-Policy":
    "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; base-uri 'self'; frame-ancestors 'none'",
};
