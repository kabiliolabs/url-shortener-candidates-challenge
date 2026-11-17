export interface ShortCodeGenerator {
  /** Uniqueness is not guaranteed here: the repository is what enforces it. */
  generate(): string;
}
