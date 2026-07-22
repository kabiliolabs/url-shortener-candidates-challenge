export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends Error {
  constructor() {
    super("Short URL not found");
    this.name = "NotFoundError";
  }
}

export class CodeGenerationError extends Error {
  constructor() {
    super("Unable to generate a unique short code");
    this.name = "CodeGenerationError";
  }
}

export class DuplicateCodeError extends Error {
  constructor() {
    super("Short code already exists");
    this.name = "DuplicateCodeError";
  }
}
