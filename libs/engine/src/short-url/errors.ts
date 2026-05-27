export type ShortUrlErrorCode =
  | "invalid_original_url"
  | "invalid_short_code"
  | "code_generation_failed"
  | "short_url_not_found";

export class ShortUrlError extends Error {
  constructor(
    readonly code: ShortUrlErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ShortUrlError";
  }
}
