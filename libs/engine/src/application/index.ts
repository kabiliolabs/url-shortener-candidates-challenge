export type { ShortenedUrlRepository } from "./repositories";

export {
  MAX_CODE_GENERATION_ATTEMPTS,
  buildShortenedUrlPrefix,
  createShortenedUrl,
  findShortenedUrl,
  recordClick,
} from "./use-cases/url-shortener";

export type { CreateShortenedUrlDependencies } from "./use-cases/url-shortener";

export { getStatsViewData } from "./use-cases/shortened-url-stats";

export type { StatsViewData } from "./use-cases/shortened-url-stats";
