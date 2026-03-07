import { InvalidUrlError } from '../errors/UrlErrors'

const VALID_PROTOCOLS = new Set(['http:', 'https:'])

export class OriginalUrl {
  private readonly value: string

  private constructor(value: string) {
    this.value = value
  }

  get getValue(): string {
    return this.value
  }

  public static create(value: string): OriginalUrl {
    if (!value || value.trim() === '') {
      throw new InvalidUrlError('URL Cannot be empty.')
    }

    try {
      const parsedUrl = new URL(value)
      if (!VALID_PROTOCOLS.has(parsedUrl.protocol)) {
        throw new InvalidUrlError(
          `Invalid protocol. Must be ${Array.from(VALID_PROTOCOLS).join(', ')}`
        )
      }
    } catch (e: any) {
      throw new InvalidUrlError('Invalid URL format. Must be a valid http or https URL.')
    }

    return new OriginalUrl(value)
  }
}
