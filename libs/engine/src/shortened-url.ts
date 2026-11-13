/** Representa un enlace corto persistido y sus estadísticas básicas. */
export interface ShortenedUrl {
  /** Código único que identifica el enlace corto. */
  code: string;
  /** Dirección HTTP(S) de destino normalizada. */
  originalUrl: string;
  /** Fecha y hora de creación del enlace. */
  createdAt: Date;
  /** Cantidad de solicitudes de redirección registradas; no equivale a visitantes únicos. */
  clickCount: number;
}
