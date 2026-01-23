import { urlShortenerService } from "../services/url-shortener.service";

// Constants
const MAX_URL_LENGTH = 2048;
const URL_PATTERN = /^https?:\/\/.+/i;

export interface ShortenUrlActionResult {
  shortCode?: string;
  shortenedUrl?: string;
  originalUrl?: string;
  error?: string;
  isExisting?: boolean;
}

/**
 * Validates a URL string
 * Returns an error message if invalid, null if valid
 */
function validateUrl(url: string): string | null {
  // Check if URL is provided
  if (!url || !url.trim()) {
    return "URL is required";
  }

  // Check URL length
  if (url.length > MAX_URL_LENGTH) {
    return `URL is too long. Maximum length is ${MAX_URL_LENGTH} characters`;
  }

  // Check URL format (must start with http:// or https://)
  if (!URL_PATTERN.test(url)) {
    return "URL must start with http:// or https://";
  }

  // Validate URL structure
  try {
    new URL(url);
  } catch {
    return "Invalid URL format";
  }

  return null;
}

export async function shortenUrlAction({
  request,
}: {
  request: Request;
}): Promise<ShortenUrlActionResult> {
  const formData = await request.formData();
  const url = (formData.get("url") as string)?.trim();

  // Server-side validation
  const validationError = validateUrl(url);
  if (validationError) {
    return { error: validationError };
  }

  try {
    const result = await urlShortenerService.shortenUrl(url);

    return {
      shortCode: result.shortCode,
      shortenedUrl: result.shortenedUrl,
      originalUrl: result.originalUrl,
    };
  } catch (error) {
    console.error("[shorten-url.action] Error shortening URL:", error);
    return { error: "Failed to shorten URL. Please try again." };
  }
}
