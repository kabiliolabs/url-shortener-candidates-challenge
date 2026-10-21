// Read config once at startup and fail fast if something's missing,
// instead of building broken short URLs at request time.
function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

export const env = {
  publicUrl: new URL(required("PUBLIC_URL")),
  /** Only set this behind a proxy that overwrites X-Forwarded-For (see ADR-010). */
  trustProxy: process.env.TRUST_PROXY === "true",
};

export function shortUrlFor(code: string): string {
  return new URL(`/s/${code}`, env.publicUrl).toString();
}
