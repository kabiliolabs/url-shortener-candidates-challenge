import { InvalidShortCodeError } from "./errors";

const SHORT_CODE_PATTERN = /^[A-Za-z0-9_-]{8}$/;

export class ShortCode {
  private constructor(readonly value: string) {}

  static create(value: string): ShortCode {
    if (!SHORT_CODE_PATTERN.test(value)) {
      throw new InvalidShortCodeError();
    }

    return new ShortCode(value);
  }
}
