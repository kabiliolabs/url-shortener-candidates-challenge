export { canonicalizeUrl, MAX_URL_LENGTH } from "./domain/canonicalize-url";
export { codeCollisionError, isCodeCollision } from "./domain/code-collision";
export { generateCode } from "./domain/generate-code";
export { LIST_LIMIT, listShortLinks } from "./use-cases/list-short-links";
export { resolveCode } from "./use-cases/resolve-code";
export { shortenUrl } from "./use-cases/shorten-url";

export type { CanonicalizeResult } from "./domain/canonicalize-url";
export type { ShortenResult } from "./use-cases/shorten-url";
export type {
  NewShortLink,
  ShortLink,
  ShortLinkRepository,
} from "./ports/short-link-repository";
