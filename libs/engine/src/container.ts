import { CodeGenerator } from "./application/services/code-generator";
import { CreateShortUrlUseCase } from "./application/use-cases/create-short-url";
import { DeleteUrlUseCase } from "./application/use-cases/delete-url";
import { GetUrlStatsUseCase } from "./application/use-cases/get-url-stats";
import { ListUrlsUseCase } from "./application/use-cases/list-urls";
import { RedirectUrlUseCase } from "./application/use-cases/redirect-url";
import type { UrlRepository } from "./domain/repositories/url-repository";
import { PrismaUrlRepository } from "./infrastructure/repositories/prisma-url-repository";

const urlRepository: UrlRepository = new PrismaUrlRepository();
const codeGenerator = new CodeGenerator();

export const createShortUrlUseCase = new CreateShortUrlUseCase(
  urlRepository,
  codeGenerator,
);
export const redirectUrlUseCase = new RedirectUrlUseCase(urlRepository);
export const listUrlsUseCase = new ListUrlsUseCase(urlRepository);
export const getUrlStatsUseCase = new GetUrlStatsUseCase(urlRepository);
export const deleteUrlUseCase = new DeleteUrlUseCase(urlRepository);
