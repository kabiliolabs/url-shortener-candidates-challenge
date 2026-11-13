/** Error de dominio para destinos vacíos, inválidos o con protocolos no permitidos. */
export class InvalidDestinationUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidDestinationUrlError";
  }
}

/**
 * Normaliza el destino y permite únicamente direcciones HTTP o HTTPS.
 * @throws InvalidDestinationUrlError si el valor no es una URL HTTP(S) válida.
 */
export function normalizeDestinationUrl(value: string): string {
  let url: URL;

  try {
    url = new URL(value.trim());
  } catch {
    throw new InvalidDestinationUrlError(
      "Enter a valid URL, including http:// or https://.",
    );
  }

  if (
    (url.protocol !== "http:" && url.protocol !== "https:") ||
    !url.hostname
  ) {
    throw new InvalidDestinationUrlError(
      "Only HTTP and HTTPS URLs are allowed.",
    );
  }

  return url.href;
}
