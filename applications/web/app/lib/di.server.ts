import { 
  PrismaUrlRepository, 
  NanoidGenerator, 
  CreateShortUrlUseCase, 
  GetUrlByCodeUseCase, 
  IncrementClickUseCase, 
  GetRecentUrlsUseCase 
} from '@url-shortener/engine';

// Singletons for infrastructure adapters
const urlRepository = new PrismaUrlRepository();
const shortCodeGenerator = new NanoidGenerator();

// Factory functions for Use Cases (Dependency Injection)
export const makeCreateShortUrlUseCase = () => {
  return new CreateShortUrlUseCase(urlRepository, shortCodeGenerator);
};

export const makeGetUrlByCodeUseCase = () => {
  return new GetUrlByCodeUseCase(urlRepository);
};

export const makeIncrementClickUseCase = () => {
  return new IncrementClickUseCase(urlRepository);
};

export const makeGetRecentUrlsUseCase = () => {
  return new GetRecentUrlsUseCase(urlRepository);
};
