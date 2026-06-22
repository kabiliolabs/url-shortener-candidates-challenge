import { z } from "zod";
import { InvalidUrlError } from "./errors";

/** Upper bound on the raw URL length, matching common browser/DB limits. */
const MAX_URL_LENGTH = 2048;

/** Only real web links are shortenable; everything else is rejected. */
const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

/** Cheap structural checks (presence + length) before parsing as a URL. */
const rawUrlSchema = z
  .string()
  .trim()
  .min(1, "URL is required")
  .max(MAX_URL_LENGTH, `URL must be at most ${MAX_URL_LENGTH} characters`);

/**
 * Decides whether a hostname points at a loopback, link-local, or RFC1918
 * private address — the targets an attacker would use to make the shortener
 * reach internal services (SSRF).
 *
 * Limitation: this inspects the literal hostname only. It does not resolve
 * DNS, so a public hostname that resolves to a private IP is NOT caught here;
 * that would require a network lookup at redirect time.
 *
 * @param hostname - The `URL.hostname` (IPv6 may arrive wrapped in brackets).
 * @returns `true` if the host is private/internal and must be blocked.
 */
export function isPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, ""); // strip IPv6 brackets

  if (host === "localhost" || host.endsWith(".localhost")) return true;
  if (host === "::1" || host.startsWith("fc") || host.startsWith("fd")) return true;

  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [a, b] = ipv4.slice(1).map(Number);
    if (a === 127) return true; // loopback 127.0.0.0/8
    if (a === 10) return true; // private 10.0.0.0/8
    if (a === 192 && b === 168) return true; // private 192.168.0.0/16
    if (a === 172 && b >= 16 && b <= 31) return true; // private 172.16.0.0/12
    if (a === 169 && b === 254) return true; // link-local 169.254.0.0/16
    if (a === 0) return true; // "this" network 0.0.0.0/8
  }
  return false;
}

/**
 * Validates and normalizes a user-supplied URL, returning a safe, canonical
 * href ready to persist and later redirect to. Throws {@link InvalidUrlError}
 * (with a user-facing message) when the input is unusable.
 *
 * Pipeline: trim + length check -> parse as URL -> allow only http/https ->
 * block private/internal hosts (see {@link isPrivateHost}).
 *
 * @param raw - The untrusted string from the form.
 * @returns The normalized absolute URL (e.g. `https://example.com/`).
 * @throws {InvalidUrlError} If empty, too long, malformed, wrong scheme, or private.
 */
export function validateAndNormalizeUrl(raw: string): string {
  const parsed = rawUrlSchema.safeParse(raw);
  if (!parsed.success) {
    throw new InvalidUrlError(parsed.error.issues[0]?.message ?? "Invalid URL");
  }

  let url: URL;
  try {
    url = new URL(parsed.data);
  } catch {
    throw new InvalidUrlError("Please enter a valid URL");
  }

  if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
    throw new InvalidUrlError("Only http and https URLs are allowed");
  }
  if (isPrivateHost(url.hostname)) {
    throw new InvalidUrlError(
      "URLs pointing to private or internal hosts are not allowed",
    );
  }

  return url.href;
}
