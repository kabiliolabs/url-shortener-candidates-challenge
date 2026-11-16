/** Its message is written for the person who submitted the URL and is safe to show. */
export class InvalidUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidUrlError";
  }
}

export class ShortCodeAlreadyExists extends Error {
  constructor(readonly code: string) {
    super(`Short code "${code}" already exists`);
    this.name = "ShortCodeAlreadyExists";
  }
}

export class ShortUrlNotFound extends Error {
  constructor(readonly code: string) {
    super(`No short URL with code "${code}"`);
    this.name = "ShortUrlNotFound";
  }
}

export class CodeGenerationFailed extends Error {
  constructor(readonly attempts: number) {
    super(`Could not generate a unique short code after ${attempts} attempts`);
    this.name = "CodeGenerationFailed";
  }
}
