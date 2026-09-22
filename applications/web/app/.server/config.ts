function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable ${name}`);
  return value;
}

const publicUrl = requireEnv("PUBLIC_URL");
if (!URL.canParse(publicUrl)) {
  throw new Error(`PUBLIC_URL must be an absolute URL, got "${publicUrl}"`);
}

export const config = {
  publicUrl,
  databaseUrl: requireEnv("DATABASE_URL"),
};

export function shortLinkFor(shortCode: string): string {
  return new URL(`/s/${shortCode}`, config.publicUrl).href;
}
