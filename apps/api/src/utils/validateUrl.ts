export type UrlValidationResult =
  | { valid: true; url: URL }
  | { valid: false; code: string; message: string; field: "url" };

export const validateUrl = (value: unknown): UrlValidationResult => {
  if (typeof value !== "string" || !value.trim()) {
    return {
      valid: false,
      code: "MISSING_URL",
      message: "A URL is required.",
      field: "url",
    };
  }

  let url: URL;

  try {
    url = new URL(value.trim());
  } catch {
    return {
      valid: false,
      code: "INVALID_URL",
      message: "The URL is not formatted correctly.",
      field: "url",
    };
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    return {
      valid: false,
      code: "UNSUPPORTED_PROTOCOL",
      message: "The URL must use HTTP or HTTPS.",
      field: "url",
    };
  }

  return { valid: true, url };
};
