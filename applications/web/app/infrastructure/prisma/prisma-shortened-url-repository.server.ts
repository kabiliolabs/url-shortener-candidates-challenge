import { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";
import {
  OriginalUrlConflictError,
  ShortCodeConflictError,
  type NewShortenedUrl,
  type ShortenedUrlPage,
  type ShortenedUrlPageQuery,
  type ShortenedUrl,
  type ShortenedUrlRepository,
} from "@url-shortener/engine";

/** Adaptador que implementa el puerto del repositorio mediante Prisma y PostgreSQL. */
export class PrismaShortenedUrlRepository
  implements ShortenedUrlRepository
{
  constructor(private readonly client: PrismaClient) {}

  /** Persiste el enlace y traduce las restricciones únicas a errores del dominio. */
  async create(shortenedUrl: NewShortenedUrl): Promise<ShortenedUrl> {
    try {
      return await this.client.shortenedUrl.create({
        data: shortenedUrl,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const target = error.meta?.target;
        const targets = Array.isArray(target) ? target : [target];

        if (
          targets.includes("originalUrl") ||
          targets.includes("original_url") ||
          targets.includes("shortened_urls_original_url_key")
        ) {
          throw new OriginalUrlConflictError();
        }

        if (
          targets.includes("code") ||
          targets.includes("shortened_urls_pkey")
        ) {
          throw new ShortCodeConflictError();
        }
      }

      throw error;
    }
  }

  /** Incrementa atómicamente el contador del enlace y devuelve null si no existe. */
  async findByCodeAndRecordClick(
    code: string,
  ): Promise<ShortenedUrl | null> {
    try {
      return await this.client.shortenedUrl.update({
        where: { code },
        data: { clickCount: { increment: 1 } },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return null;
      }

      throw error;
    }
  }

  /** Busca el enlace asociado a una URL de destino. */
  findByOriginalUrl(originalUrl: string): Promise<ShortenedUrl | null> {
    return this.client.shortenedUrl.findFirst({
      where: { originalUrl },
      orderBy: { createdAt: "asc" },
    });
  }

  /** Aplica el filtro y la paginación en la base de datos. */
  async findPage(query: ShortenedUrlPageQuery): Promise<ShortenedUrlPage> {
    const where: Prisma.ShortenedUrlWhereInput = query.search
      ? {
          originalUrl: {
            contains: query.search,
            mode: "insensitive",
          },
        }
      : {};
    const totalCount = await this.client.shortenedUrl.count({ where });
    const totalPages = Math.max(1, Math.ceil(totalCount / query.pageSize));
    const currentPage = Math.min(Math.max(1, query.page), totalPages);
    const shortenedUrls = await this.client.shortenedUrl.findMany({
      where,
      skip: (currentPage - 1) * query.pageSize,
      take: query.pageSize,
      orderBy: [{ createdAt: "desc" }, { code: "asc" }],
    });

    return { shortenedUrls, totalCount, currentPage, totalPages };
  }
}
