// Domain entity & ports
export type { ShortenedUrl } from "./domain/shortened-url";
export type {
  ShortUrlRepository,
  NewShortUrl,
} from "./domain/ports/short-url-repository";
export type { CodeGenerator } from "./domain/ports/code-generator";

// Domain errors
export {
  InvalidUrlError,
  InvalidShortCodeError,
  DuplicateCodeError,
} from "./domain/errors";

// Value objects
export { OriginalUrl } from "./domain/value-objects/original-url";
export { ShortCode } from "./domain/value-objects/short-code";

// Code generator (pure infrastructure — no I/O)
export {
  createCodeGenerator,
  DEFAULT_CODE_LENGTH,
} from "./infrastructure/code-generator";

// Use-case factories
export { createShortUrlUseCase } from "./application/create-short-url";
export type {
  CreateShortUrl,
  CreateShortUrlDeps,
  CreateShortUrlInput,
} from "./application/create-short-url";
export { resolveShortUrlUseCase } from "./application/resolve-short-url";
export type {
  ResolveShortUrl,
  ResolveShortUrlDeps,
} from "./application/resolve-short-url";
