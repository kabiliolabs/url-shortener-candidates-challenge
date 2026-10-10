import type { ShortCode } from "./short-code";

/** Port: produces candidate codes. Uniqueness is NOT guaranteed here; the repository enforces it. */
export interface ShortCodeGenerator {
  generate(): ShortCode;
}
