// Public surface of the domain library. The web application may only import
// from here, never from an internal path.

export { DestinationUrl } from "./domain/destination-url";
export { isInternalHost } from "./domain/internal-host";
export {
  ShortCode,
  secureRandomInt,
  SHORT_CODE_ALPHABET,
  SHORT_CODE_LENGTH,
  type RandomIntSource,
} from "./domain/short-code";
export { ShortenedUrl } from "./domain/shortened-url";
export type {
  ShortenedUrlRepository,
  ShortenedUrlStats,
} from "./domain/shortened-url-repository";
export {
  DomainError,
  InvalidUrlError,
  InvalidShortCodeError,
  ShortCodeCollisionError,
  ShortCodeExhaustionError,
  ShortenedUrlNotFoundError,
} from "./domain/errors";

export { ShortenUrl } from "./application/shorten-url";
export { ResolveShortenedUrl } from "./application/resolve-shortened-url";
export { ListShortenedUrls } from "./application/list-shortened-urls";
