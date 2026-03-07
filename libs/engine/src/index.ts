// DTOs & Validation
export * from './dtos/UrlDto'

// Domain
export * from './domain/entities/Url'
export * from './domain/value-objects/ShortCode'
export * from './domain/value-objects/OriginalUrl'
export * from './domain/repositories/IUrlRepository'
export * from './domain/services/IShortCodeGenerator'
// Infrastructure
export * from './infrastructure/db';
export * from './infrastructure/PrismaUrlRepository';
export * from './infrastructure/NanoidGenerator';

// Use Cases
export * from './use-cases/CreateShortUrlUseCase';
export * from './use-cases/GetUrlByCodeUseCase';
export * from './use-cases/IncrementClickUseCase';
export * from './use-cases/GetRecentUrlsUseCase';

export { baseUrl } from './base-url'
