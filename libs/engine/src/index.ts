export { baseUrl } from "./infrastructure/config/env";

export type { ShortenedUrl } from "./domain/entities/shortened-url";
export type {
  CreateShortenedUrlData,
  UrlRepository,
} from "./domain/repositories/url-repository";
export { DuplicateShortCodeError } from "./domain/errors/duplicate-short-code.error";
export { DomainError } from "./domain/errors/domain-error";
export { InvalidUrlError } from "./domain/errors/invalid-url.error";
export { UrlNotFoundError } from "./domain/errors/url-not-found.error";

export { CodeGenerator } from "./application/services/code-generator";
export type { CodeGeneratorOptions } from "./application/services/code-generator";

export { CreateShortUrlUseCase } from "./application/use-cases/create-short-url";
export { RedirectUrlUseCase } from "./application/use-cases/redirect-url";
export { ListUrlsUseCase } from "./application/use-cases/list-urls";
export { GetUrlStatsUseCase } from "./application/use-cases/get-url-stats";
export { DeleteUrlUseCase } from "./application/use-cases/delete-url";

export { createShortUrlSchema } from "./application/validation/create-short-url";
export type { CreateShortUrlInput } from "./application/validation/create-short-url";

export {
  createShortUrlUseCase,
  deleteUrlUseCase,
  getUrlStatsUseCase,
  listUrlsUseCase,
  redirectUrlUseCase,
} from "./container";
