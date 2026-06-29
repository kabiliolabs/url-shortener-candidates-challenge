/**
 * Domain errors. These are part of the engine's public contract: adapters
 * (e.g. the Prisma repository in the web app) translate storage-specific
 * failures into these, and use-cases / routes react to them — never to raw
 * infrastructure exceptions.
 */

/** Thrown by the `OriginalUrl` value object for malformed or disallowed URLs. */
export class InvalidUrlError extends Error {
  constructor(public readonly url: string) {
    super("Invalid URL: only http and https URLs are allowed");
    this.name = "InvalidUrlError";
  }
}

/** Thrown by the `ShortCode` value object for malformed short codes. */
export class InvalidShortCodeError extends Error {
  constructor(public readonly code: string) {
    super("Invalid short code");
    this.name = "InvalidShortCodeError";
  }
}

/**
 * Thrown by a `ShortUrlRepository` implementation when a code already exists
 * (e.g. a Prisma `P2002` unique-constraint violation). The repository does NOT
 * regenerate codes; the create use-case catches this and retries with a new
 * code, keeping storage and code generation decoupled.
 */
export class DuplicateCodeError extends Error {
  constructor(public readonly code: string) {
    super(`Short code already exists: ${code}`);
    this.name = "DuplicateCodeError";
  }
}
