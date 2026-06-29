/**
 * Port for short-code generation. Use-cases depend on this interface, never on
 * a concrete generator (DIP) — swappable for a nanoid-backed implementation at
 * runtime or a deterministic stub in tests, without touching the use-case (OCP).
 */
export interface CodeGenerator {
  generate(): string;
}
