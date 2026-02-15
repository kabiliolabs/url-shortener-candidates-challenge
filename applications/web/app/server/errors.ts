/**
 * Server-side error classes and helpers. Use in services and API handlers.
 * Do not import in frontend code.
 */

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export function isClientError(e: unknown): boolean {
  return (
    e instanceof Error &&
    (e.name === "ValidationError" || e.name === "ConflictError")
  );
}
