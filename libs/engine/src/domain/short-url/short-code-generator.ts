import type { ShortCode } from "./short-code";

/** Port for creating new short codes. Uniqueness is the repository's job, not the generator's. */
export interface ShortCodeGenerator {
  generate(): ShortCode;
}
