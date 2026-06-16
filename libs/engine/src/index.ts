export { AppError, type ErrorCode } from "./application/errors/app-error";

export {
	CreateShortUrlUseCase,
	type CreateShortUrlInput,
	type CreateShortUrlOutput,
} from "./application/use-cases/create-short-url";
export {
	RedirectToOriginalUrlUseCase,
	type RedirectToOriginalUrlInput,
	type RedirectToOriginalUrlOutput,
} from "./application/use-cases/redirect-to-original-url";
export { TrackClickUseCase, type TrackClickInput } from "./application/use-cases/track-click";
export { GetUrlStatsUseCase, type GetUrlStatsInput } from "./application/use-cases/get-url-stats";

export { ShortUrl, type ShortUrlProps } from "./domain/entities/short-url";
export {
	DuplicateShortCodeError,
	type CreateShortUrlInput as RepositoryCreateShortUrlInput,
	type ShortUrlRepository,
	type UrlStatsItem,
} from "./domain/repositories/short-url-repository";
export { type ShortCodeGenerator } from "./domain/services/short-code-generator";
export { OriginalUrl } from "./domain/value-objects/original-url";
export { ShortCode } from "./domain/value-objects/short-code";

export { NanoIdShortCodeGenerator } from "./infrastructure/nanoid-short-code-generator";
