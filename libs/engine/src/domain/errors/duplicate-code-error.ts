export class DuplicateCodeError extends Error {
  constructor(code: string) {
    super(`Duplicate code: ${code}`);
    this.name = "DuplicateCodeError";
  }
}

export function isDuplicateCodeError(error: unknown): error is DuplicateCodeError {
  return (
    error instanceof DuplicateCodeError ||
    (error instanceof Error && error.name === "DuplicateCodeError")
  );
}
