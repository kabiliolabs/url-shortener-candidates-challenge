/**
 * Maps raw database/connection errors to a user-facing message. Server-only.
 */
export function toUserFacingDatabaseError(raw: string): string {
  if (
    /denied access on the database|Can't reach database server|connection refused|ECONNREFUSED|(not available)/i.test(raw)
  ) {
    return (
      "Database is not available. Check that PostgreSQL is running, DATABASE_URL is set (e.g. in .env: postgresql://urlshortener:urlshortener@localhost:5432/urlshortener), and the user has access. See README or applications/web/DATABASE.md."
    );
  }
  return raw;
}
