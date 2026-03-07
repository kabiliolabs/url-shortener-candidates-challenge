export class DomainError extends Error {
  public readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = code;
    this.code = code;
  }
}

export class UrlNotFoundError extends DomainError {
  constructor(shortCode: string) {
    super(`URL with short code '${shortCode}' was not found.`, 'URL_NOT_FOUND');
  }
}

export class ShortCodeConflictError extends DomainError {
  constructor(shortCode: string) {
    super(`Short code '${shortCode}' already exists.`, 'SHORT_CODE_CONFLICT');
  }
}

export class InvalidUrlError extends DomainError {
  constructor(message: string) {
    super(message, 'INVALID_URL');
  }
}
