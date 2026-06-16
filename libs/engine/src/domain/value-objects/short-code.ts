import { AppError } from "../../application/errors/app-error";

const SHORT_CODE_REGEX = /^[A-Za-z0-9_-]{6,16}$/;

export class ShortCode {
  private constructor(private readonly value: string) {}

  static create(value: string): ShortCode {
    if (!SHORT_CODE_REGEX.test(value)) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Invalid short code format.",
        400,
      );
    }

    return new ShortCode(value);
  }

  toString(): string {
    return this.value;
  }
}
