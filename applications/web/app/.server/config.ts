// Environment access lives here, in the web app — never in
// `@url-shortener/engine`, which stays a pure domain library.

const DEFAULT_BASE_URL = "http://localhost:5173";

function resolveBaseUrl(raw: string | undefined): string {
  if (!raw) {
    return DEFAULT_BASE_URL;
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    console.warn(
      `[config] PUBLIC_URL is not a valid URL ("${raw}"); falling back to ${DEFAULT_BASE_URL}`,
    );
    return DEFAULT_BASE_URL;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    console.warn(
      `[config] PUBLIC_URL must be http/https ("${raw}"); falling back to ${DEFAULT_BASE_URL}`,
    );
    return DEFAULT_BASE_URL;
  }

  return parsed.href.replace(/\/+$/, "");
}

export const baseUrl = resolveBaseUrl(process.env.PUBLIC_URL);
