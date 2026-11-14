export { baseUrl } from "./base-url";

export {
  shortenedUrls,
  generateShortCode,
} from "./modules/url-shortener/shortened-url";

export { URL } from "./shared/value-objects/url";
export type { URLValidationError } from "./shared/value-objects/url";
export { ShortenedURL } from "./modules/url-shortener/domain/shortened-url";
export type { ShortenedURLValidationError } from "./modules/url-shortener/domain/shortened-url";
export { Ok, Err } from "./shared/types/result";
export type { Result } from "./shared/types/result";

export { ShortenURLUseCase } from "./modules/url-shortener/application/usecases/shorten-url";
export { ResolveShortenedURLUseCase } from "./modules/url-shortener/application/usecases/resolve-shortened-url";
export type { ResolveShortenedURLError } from "./modules/url-shortener/application/usecases/resolve-shortened-url";
