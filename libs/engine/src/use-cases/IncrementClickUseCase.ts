import type { IUrlRepository } from '../domain/repositories/IUrlRepository';
import { UrlNotFoundError } from '../domain/errors/UrlErrors';

export class IncrementClickUseCase {
  constructor(private readonly urlRepository: IUrlRepository) {}

  async execute(code: string): Promise<void> {
    const url = await this.urlRepository.findByCode(code);
    
    if (!url) {
      throw new UrlNotFoundError(code);
    }

    await this.urlRepository.incrementClicks(code);
  }
}
