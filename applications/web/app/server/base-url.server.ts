export function resolveBaseUrl(request: Request): string {
  if (process.env.PUBLIC_URL) {
    return process.env.PUBLIC_URL.replace(/\/$/, "");
  }

  return new URL(request.url).origin;
}
