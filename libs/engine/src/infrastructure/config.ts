export const baseUrl = process.env.PUBLIC_URL;

// Same value used to build short links, so the self-domain check can't drift from it.
export const ownHostname = baseUrl ? new URL(baseUrl).hostname : undefined;

function positiveIntFromEnv(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

export const rateLimit = {
  limit: positiveIntFromEnv("RATE_LIMIT_MAX", 20),
  windowMs: positiveIntFromEnv("RATE_LIMIT_WINDOW_MS", 60_000),
};

// A 2048-char URL percent-encoded can triple in size; 8 KiB leaves headroom for that.
export const maxBodyBytes = positiveIntFromEnv("MAX_BODY_BYTES", 8 * 1024);

export const frontendOrigin =
  process.env.FRONTEND_ORIGIN ?? (baseUrl ? new URL(baseUrl).origin : undefined);
