import { ValidationError } from "../../shared/errors";

const SHORT_CODE_REGEX = /^[a-zA-Z0-9_-]{6,12}$/;

export class ShortCode {
  private constructor(readonly value: string) {}

  static create(raw: string): ShortCode {
    if (!raw || !SHORT_CODE_REGEX.test(raw)) {
      throw new ValidationError("Short code format is invalid.");
    }

    return new ShortCode(raw);
  }
}
