/**
 * Domain errors.
 *
 * The domain speaks in terms of its own failures, never in HTTP terms. Adapters
 * (routes) are the ones that decide how each error maps to a status code or to
 * a message on screen. That keeps `libs/engine` framework-agnostic.
 */
export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** The input is not a URL we are willing to shorten. Message is user-facing. */
export class InvalidUrlError extends DomainError {}

/** The short code is malformed (wrong charset or length). */
export class InvalidShortCodeError extends DomainError {}

/** The generated code is already taken. Signalled by the repository, retried by the use case. */
export class ShortCodeCollisionError extends DomainError {}

/** Could not find a free code after N attempts. Should be practically impossible. */
export class ShortCodeExhaustionError extends DomainError {}

/** No shortened URL exists for the requested code. */
export class ShortenedUrlNotFoundError extends DomainError {}
