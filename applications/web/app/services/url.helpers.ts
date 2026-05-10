export function validateUrl(url: string): string | null {
  if (!url || url.trim().length === 0) return "URL is required";
  if (url.length > 2048) return "URL must be 2048 characters or fewer";
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "URL must use http or https protocol";
    }
  } catch {
    return "Invalid URL format";
  }
  return null;
}

export function truncateUrl(url: string, maxLength = 50): string {
  return url.length > maxLength ? url.slice(0, maxLength) + "…" : url;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString();
}
