export class InvalidUrlError extends Error {
  constructor(public readonly url: string) {
    super("Invalid URL: only http and https URLs are allowed");
    this.name = "InvalidUrlError";
  }
}

export class InvalidShortCodeError extends Error {
  constructor(public readonly code: string) {
    super("Invalid short code");
    this.name = "InvalidShortCodeError";
  }
}

export class DuplicateCodeError extends Error {
  constructor(public readonly code: string) {
    super(`Short code already exists: ${code}`);
    this.name = "DuplicateCodeError";
  }
}
