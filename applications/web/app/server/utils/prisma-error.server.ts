import { PRISMA_NOT_FOUND, PRISMA_UNIQUE_VIOLATION } from "../constants.js";

function isPrismaError(e: unknown): e is { code: string } {
  return !!(e && typeof e === "object" && "code" in e && typeof (e as { code: string }).code === "string");
}

export function isUniqueViolation(e: unknown): boolean {
  return isPrismaError(e) && e.code === PRISMA_UNIQUE_VIOLATION;
}

export function isNotFoundError(e: unknown): boolean {
  return isPrismaError(e) && e.code === PRISMA_NOT_FOUND;
}
