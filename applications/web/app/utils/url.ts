const URL_MAX_LENGTH = 2048;

/**
 * Normalizes a URL string: trims and adds https:// if no protocol.
 */
export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/** Result of frontend URL validation (before calling the API). */
export type UrlValidationResult =
  | { valid: true; url: string }
  | { valid: false; message: string };

/**
 * Validates a URL on the frontend: protocol, host with TLD, and length.
 * Use before submitting the shorten form.
 */
export function validateUrl(input: string): UrlValidationResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { valid: false, message: "Please enter a URL (e.g. https://example.com)." };
  }

  const url = normalizeUrl(trimmed);
  if (url.length > URL_MAX_LENGTH) {
    return {
      valid: false,
      message: `URL is too long. Please use a link that is ${URL_MAX_LENGTH.toLocaleString()} characters or less.`,
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return {
      valid: false,
      message: "This doesn’t look like a valid web address. Please enter a full URL (e.g. https://example.com).",
    };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      valid: false,
      message: "Only http:// and https:// links are supported. Please enter a web URL.",
    };
  }

  const hostname = parsed.hostname;
  if (!hostname) {
    return {
      valid: false,
      message: "Please enter a URL with a valid domain (e.g. example.com).",
    };
  }

  const lastDot = hostname.lastIndexOf(".");
  if (lastDot === -1 || lastDot === hostname.length - 1) {
    return {
      valid: false,
      message: "The URL must include a valid domain with an extension (e.g. .com, .org).",
    };
  }
  const tld = hostname.slice(lastDot + 1);
  if (tld.length < 2) {
    return {
      valid: false,
      message: "The URL must include a valid domain with an extension (e.g. .com, .org).",
    };
  }

  return { valid: true, url };
}
