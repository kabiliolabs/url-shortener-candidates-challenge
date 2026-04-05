export {
  MAX_CODE_GENERATION_ATTEMPTS,
  buildShortenedUrlPrefix,
  createShortenedUrl,
  findShortenedUrl,
  getStatsViewData,
  recordClick,
} from "./application";

export type {
  CreateShortenedUrlDependencies,
  ShortenedUrlRepository,
  StatsViewData,
} from "./application";

export {
  CodeGenerationExhaustedError,
  DuplicateCodeError,
  isCodeGenerationExhaustedError,
  isDuplicateCodeError,
} from "./domain";

export type { CreateShortenedUrlInput, ShortenedUrl } from "./domain";
export { SHORT_CODE_LENGTH, generateShortCode } from "./shortened-url";
