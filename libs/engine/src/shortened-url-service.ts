import {
  OriginalUrlConflictError,
  ShortCodeConflictError,
  type ShortenedUrlPageQuery,
  type ShortenedUrlRepository,
} from "./shortened-url-repository";
import type { ShortCodeGenerator } from "./short-code-generator";
import { normalizeDestinationUrl } from "./normalize-destination-url";

const maxCodeGenerationAttempts = 3;

/** Error al agotar los reintentos para generar un código corto disponible. */
export class ShortCodeGenerationError extends Error {
  constructor() {
    super("Could not generate a unique short code.");
    this.name = "ShortCodeGenerationError";
  }
}

/** Coordina las reglas de negocio para crear, consultar y listar enlaces cortos. */
export class ShortenedUrlService {
  constructor(
    private readonly repository: ShortenedUrlRepository,
    private readonly codeGenerator: ShortCodeGenerator,
  ) {}

  /**
   * Crea o reutiliza el enlace de un destino normalizado.
   * Resuelve carreras de creación y reintenta colisiones del código generado.
   */
  async shorten(originalUrl: string) {
    const normalizedUrl = normalizeDestinationUrl(originalUrl);
    const existing = await this.repository.findByOriginalUrl(normalizedUrl);
    if (existing) {
      return existing;
    }

    for (let attempt = 0; attempt < maxCodeGenerationAttempts; attempt++) {
      try {
        return await this.repository.create({
          code: this.codeGenerator.generate(),
          originalUrl: normalizedUrl,
        });
      } catch (error) {
        if (error instanceof OriginalUrlConflictError) {
          const existing = await this.repository.findByOriginalUrl(
            normalizedUrl,
          );
          if (existing) {
            return existing;
          }
          throw error;
        }

        if (error instanceof ShortCodeConflictError) continue;

        throw error;
      }
    }

    throw new ShortCodeGenerationError();
  }

  /** Recupera un enlace por código y registra el clic que origina la consulta. */
  findByCodeAndRecordClick(code: string) {
    return this.repository.findByCodeAndRecordClick(code);
  }

  /** Delega al repositorio la consulta paginada de enlaces. */
  listShortenedUrls(query: ShortenedUrlPageQuery) {
    return this.repository.findPage(query);
  }
}
