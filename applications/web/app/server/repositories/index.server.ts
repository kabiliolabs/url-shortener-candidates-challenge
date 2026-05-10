import { PrismaUrlRepository } from "./prisma-url.repository.server.js";
import { PrismaClickRepository } from "./prisma-click.repository.server.js";
import type { UrlRepository } from "./url.repository.js";
import type { ClickRepository } from "./click.repository.js";

export const urlRepository: UrlRepository = new PrismaUrlRepository();
export const clickRepository: ClickRepository = new PrismaClickRepository();
