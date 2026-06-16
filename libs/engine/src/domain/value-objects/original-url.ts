import { AppError } from "../../application/errors/app-error";

export class OriginalUrl {
  private constructor(private readonly value: string) {}

  static create(input: string): OriginalUrl {
    let parsed: URL;

    try {
      parsed = new URL(input);
    } catch {
      throw new AppError(
        "VALIDATION_ERROR",
        "Please provide a valid URL.",
        400,
      );
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new AppError(
        "VALIDATION_ERROR",
        "Only HTTP and HTTPS URLs are supported.",
        400,
      );
    }

    return new OriginalUrl(parsed.toString());
  }

  toString(): string {
    return this.value;
  }
}
