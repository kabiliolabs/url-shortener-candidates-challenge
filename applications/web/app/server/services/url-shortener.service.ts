/**
 * Temporary in-memory URL shortener service.
 * Will be replaced with repository-backed implementation in Phase 3.
 */

const shortenedUrls = new Map<string, string>();

export function getBaseUrl(): string {
  return process.env.PUBLIC_URL ?? "http://localhost:5173";
}

export function generateShortCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const length = 6;
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function createShortUrl(url: string): { shortCode: string; fullShortUrl: string } {
  const shortCode = generateShortCode();
  shortenedUrls.set(shortCode, url);
  return {
    shortCode,
    fullShortUrl: `${getBaseUrl()}/s/${shortCode}`,
  };
}

export function resolveShortCode(code: string): string | undefined {
  return shortenedUrls.get(code);
}
