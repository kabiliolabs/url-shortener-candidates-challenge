export const MAX_URL_LENGTH = 2048;

export type CanonicalizeResult =
  | { ok: true; url: string }
  | { ok: false; message: string };

export function canonicalizeUrl(input: string): CanonicalizeResult {
  const trimmed = input.trim();
  let parsed: URL;

  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      ok: false,
      message: "Enter a valid URL including http:// or https://.",
    };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      ok: false,
      message: "Only http and https URLs can be shortened.",
    };
  }

  if (parsed.username !== "" || parsed.password !== "") {
    return {
      ok: false,
      message: "URLs with a username or password can't be shortened.",
    };
  }

  if (parsed.href.length > MAX_URL_LENGTH) {
    return {
      ok: false,
      message: `URL must be ${MAX_URL_LENGTH} characters or fewer.`,
    };
  }

  return { ok: true, url: parsed.href };
}
