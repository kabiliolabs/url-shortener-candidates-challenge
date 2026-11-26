const CODE_COLLISION = "CodeCollisionError";

export function codeCollisionError(): Error {
  const error = new Error("Short code already exists");
  error.name = CODE_COLLISION;
  return error;
}

export function isCodeCollision(error: unknown): boolean {
  return error instanceof Error && error.name === CODE_COLLISION;
}
