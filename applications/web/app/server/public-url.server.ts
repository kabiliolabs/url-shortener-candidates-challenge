const defaultPublicUrl = "http://localhost:3000";

export function getPublicUrl(): string {
  const configuredUrl = process.env.PUBLIC_URL?.trim() || defaultPublicUrl;
  return configuredUrl.replace(/\/+$/, "");
}

export function getShortUrl(code: string): string {
  return `${getPublicUrl()}/s/${code}`;
}

export function getDisplayedShortUrl(originalUrl: string, code: string): string {
  return `${new URL(originalUrl).origin}/s/${code}`;
}
