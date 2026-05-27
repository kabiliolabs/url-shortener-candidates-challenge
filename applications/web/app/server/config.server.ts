export function getPublicUrl(): string {
  const publicUrl = process.env.PUBLIC_URL;

  if (!publicUrl) {
    throw new Error("PUBLIC_URL environment variable is required");
  }

  return publicUrl;
}

export function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  return databaseUrl;
}
