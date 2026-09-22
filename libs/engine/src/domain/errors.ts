export class ShortCodeTakenError extends Error {
  constructor(shortCode: string) {
    super(`Short code "${shortCode}" is already taken`);
    this.name = "ShortCodeTakenError";
  }
}

export class ShortCodeGenerationError extends Error {
  constructor(attempts: number) {
    super(`Could not generate a unique short code after ${attempts} attempts`);
    this.name = "ShortCodeGenerationError";
  }
}
