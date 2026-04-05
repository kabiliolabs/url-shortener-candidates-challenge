export class CodeGenerationExhaustedError extends Error {
  constructor(maxAttempts: number) {
    super(`Failed to generate a unique code after ${maxAttempts} attempts`);
    this.name = "CodeGenerationExhaustedError";
  }
}

export function isCodeGenerationExhaustedError(
  error: unknown,
): error is CodeGenerationExhaustedError {
  return error instanceof CodeGenerationExhaustedError;
}
