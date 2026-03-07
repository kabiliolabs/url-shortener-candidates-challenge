import { InvalidUrlError } from '../errors/UrlErrors'

const MAX_LENGTH = 10
const MIN_LENGTH = 1
const REGEX_SHORT_CODE = new RegExp(`^[a-zA-Z0-9_-]{${MIN_LENGTH},${MAX_LENGTH}}$`)

export class ShortCode {
  private readonly value: string

  private constructor(value: string) {
    this.value = value
  }

  get getValue(): string {
    return this.value
  }

  public static validate(value: string): void {
    if (!value || value.trim() === '') {
      throw new InvalidUrlError('ShortCode cannot be empty.')
    }

    if (!REGEX_SHORT_CODE.test(value)) {
      throw new InvalidUrlError(
        `ShortCode must be ${MIN_LENGTH}-${MAX_LENGTH} characters long and contain only alphanumeric characters, dashes, or underscores.`
      )
    }
  }

  public static create(value: string): ShortCode {
    ShortCode.validate(value)
    return new ShortCode(value)
  }
}
