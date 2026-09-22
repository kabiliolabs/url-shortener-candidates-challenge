export const MAX_URL_LENGTH = 2048;

export type UrlValidationReason =
  | "required"
  | "missingScheme"
  | "invalid"
  | "scheme"
  | "credentials"
  | "selfLink"
  | "tooLong";

const MESSAGES: Record<UrlValidationReason, string> = {
  required: "Please enter a URL.",
  missingScheme: "Your URL should start with http:// or https://",
  invalid: "This doesn't look like a valid URL.",
  scheme: "Only http and https URLs are allowed.",
  credentials:
    "Embedded credentials are not permitted. They could be used for phishing.",
  selfLink: "Links to this service can't be shortened.",
  tooLong: `URLs can be at most ${MAX_URL_LENGTH} characters.`,
};

export class UrlValidationError extends Error {
  constructor(readonly reason: UrlValidationReason) {
    super(MESSAGES[reason]);
    this.name = "UrlValidationError";
  }
}

/**
 * Returns the WHATWG-serialized URL, which is what gets stored and redirected to.
 * Validating the serialized form (not the raw input) keeps our checks aligned with
 * what the browser will actually open, e.g. `https:\\evil.com` or `java\nscript:`.
 */
export function normalizeOriginalUrl(raw: string, publicUrl: string): string {
  const input = raw.trim();
  if (!input) throw new UrlValidationError("required");

  let url: URL;
  try {
    url = new URL(input);
  } catch {
    const missingScheme =
      !input.startsWith("/") && URL.canParse(`https://${input}`);
    throw new UrlValidationError(missingScheme ? "missingScheme" : "invalid");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new UrlValidationError("scheme");
  }
  if (url.username || url.password) {
    throw new UrlValidationError("credentials");
  }
  if (url.host === new URL(publicUrl).host) {
    throw new UrlValidationError("selfLink");
  }
  if (url.href.length > MAX_URL_LENGTH) {
    throw new UrlValidationError("tooLong");
  }
  return url.href;
}
