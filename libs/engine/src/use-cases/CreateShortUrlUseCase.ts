import type { IUrlRepository } from '../domain/repositories/IUrlRepository';
import type { IShortCodeGenerator } from '../domain/services/IShortCodeGenerator';
import { Url } from '../domain/entities/Url';
import { OriginalUrl } from '../domain/value-objects/OriginalUrl';
import { ShortCode } from '../domain/value-objects/ShortCode';
import { createUrlSchema } from '../dtos/UrlDto';
import type { CreateUrlDto, UrlDto } from '../dtos/UrlDto';
import { UrlMapper } from './UrlMapper';
import { ShortCodeConflictError } from '../domain/errors/UrlErrors';

export class CreateShortUrlUseCase {
  constructor(
    private readonly urlRepository: IUrlRepository,
    private readonly shortCodeGenerator: IShortCodeGenerator
  ) {}

  async execute(params: CreateUrlDto): Promise<UrlDto> {
    const validated = createUrlSchema.parse(params)

    let codeStr = this.shortCodeGenerator.generate()
    let shortCode = ShortCode.create(codeStr)

    let existing = await this.urlRepository.findByCode(codeStr)
    let retries = 0

    while (existing && retries < 3) {
      codeStr = this.shortCodeGenerator.generate()
      shortCode = ShortCode.create(codeStr)
      existing = await this.urlRepository.findByCode(codeStr)
      retries++
    }

    if (existing) {
      throw new ShortCodeConflictError(codeStr)
    }

    const originalUrl = OriginalUrl.create(validated.url)
    const url = Url.create({ originalUrl, shortCode })

    await this.urlRepository.save(url)

    // Fetch the saved URL to guarantee DB defaults (like id, createdAt)
    const savedUrl = await this.urlRepository.findByCode(codeStr)

    return UrlMapper.toDto(savedUrl!)
  }
}
