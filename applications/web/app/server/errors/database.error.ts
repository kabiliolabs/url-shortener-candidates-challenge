// Custom error for database issues
export class DatabaseError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = "DatabaseError";
  }
}

// Helper to check if error is a Prisma database error
export function isDatabaseError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("table") && message.includes("does not exist") ||
      message.includes("database") ||
      message.includes("prisma") ||
      error.name === "PrismaClientKnownRequestError" ||
      error.name === "PrismaClientInitializationError"
    );
  }
  return false;
}

// Wrapper to handle database errors gracefully
export function handleDatabaseError(error: unknown): never {
  if (isDatabaseError(error)) {
    throw new DatabaseError(
      "Database is not set up correctly. Please run 'pnpm db:push' to initialize the database.",
      error instanceof Error ? error : undefined
    );
  }
  throw error;
}
