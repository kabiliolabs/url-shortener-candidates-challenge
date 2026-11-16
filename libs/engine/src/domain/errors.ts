export class InvalidUrlError extends Error {
  constructor(message = "URL is required") {
    super(message);
    this.name = "InvalidUrlError";
  }
}

export class ShortUrlNotFoundError extends Error {
  constructor(public readonly code: string) {
    super(`Short URL not found: ${code}`);
    this.name = "ShortUrlNotFoundError";
  }
}

export class CodeGenerationError extends Error {
  constructor(message = "Failed to generate a short code") {
    super(message);
    this.name = "CodeGenerationError";
  }
}

export class DuplicateCodeError extends Error {
  constructor(public readonly code: string) {
    super(`Short code already exists: ${code}`);
    this.name = "DuplicateCodeError";
  }
}
