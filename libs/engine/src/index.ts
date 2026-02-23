export {
	ApplicationError,
	ConflictError,
	NotFoundError,
	RateLimitError,
	ValidationError,
} from "./shared/errors";

export type {
	CreateShortLinkInput,
	CreateShortLinkResult,
} from "./application/use-cases/create-short-link.use-case";
export type {
	ListShortLinksInput,
	ListShortLinksResult,
	ShortLinkListItem,
} from "./application/use-cases/list-short-links.use-case";
export type {
	ResolveShortLinkInput,
	ResolveShortLinkResult,
} from "./application/use-cases/resolve-short-link.use-case";

export { createUrlShortenerApplication } from "./infrastructure/composition-root";
export type { UrlShortenerApplication } from "./infrastructure/composition-root";
