/** Puerto para generar códigos cortos sin acoplar el dominio a una biblioteca concreta. */
export interface ShortCodeGenerator {
  /** Genera un código que el repositorio debe comprobar que sea único. */
  generate(): string;
}
