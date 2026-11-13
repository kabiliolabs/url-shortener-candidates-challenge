import type { ShortenedUrl } from "./shortened-url";

export type NewShortenedUrl = Pick<ShortenedUrl, "code" | "originalUrl">;

/** Criterios de búsqueda y paginación para consultar enlaces cortos. */
export interface ShortenedUrlPageQuery {
  /** Texto de búsqueda aplicado sobre la URL de destino. */
  search: string;
  /** Número de página, empezando en 1. */
  page: number;
  /** Cantidad máxima de resultados por página. */
  pageSize: number;
}

/** Resultado paginado de una consulta de enlaces cortos. */
export interface ShortenedUrlPage {
  shortenedUrls: ShortenedUrl[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

/** Puerto de persistencia utilizado por los casos de uso del acortador. */
export interface ShortenedUrlRepository {
  /** Guarda un enlace y comunica conflictos de código o destino mediante errores de dominio. */
  create(shortenedUrl: NewShortenedUrl): Promise<ShortenedUrl>;
  /** Busca un código e incrementa su contador de clics en la misma operación. */
  findByCodeAndRecordClick(code: string): Promise<ShortenedUrl | null>;
  /** Busca el enlace asociado a un destino normalizado. */
  findByOriginalUrl(originalUrl: string): Promise<ShortenedUrl | null>;
  /** Devuelve una página de resultados que cumple los criterios indicados. */
  findPage(query: ShortenedUrlPageQuery): Promise<ShortenedUrlPage>;
}

/** Indica que el destino ya tiene un enlace corto asociado. */
export class OriginalUrlConflictError extends Error {
  constructor() {
    super("A shortened URL for this destination already exists.");
    this.name = "OriginalUrlConflictError";
  }
}

/** Indica que el código generado ya está ocupado por otro enlace. */
export class ShortCodeConflictError extends Error {
  constructor() {
    super("The generated short code is already in use.");
    this.name = "ShortCodeConflictError";
  }
}
