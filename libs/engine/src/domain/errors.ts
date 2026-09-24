export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class CodeAlreadyExistsError extends DomainError {
  constructor(code: string) {
    super(`Short code "${code}" already exists`);
  }
}

export class UrlNotFoundError extends DomainError {
  constructor(code: string) {
    super(`No URL found for code "${code}"`);
  }
}

export class InvalidUrlError extends DomainError {}

export class CodeGenerationError extends DomainError {
  constructor() {
    super("Could not generate a unique short code, please try again");
  }
}