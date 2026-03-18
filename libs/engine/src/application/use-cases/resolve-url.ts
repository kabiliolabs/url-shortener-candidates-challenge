import { ShortCode } from "../../domain/value-objects/short-code";
import type { IUrlRepository } from "../../domain/repositories/url-repository";
import type { LongUrl } from "../../domain/value-objects/long-url";

export class ResolveUrlUseCase {
  constructor(private readonly repository: IUrlRepository) {}

  async execute(code: string): Promise<LongUrl> {
    const shortCode = new ShortCode(code);
    const entry = await this.repository.findByCode(shortCode);

    if (entry === null) {
      throw new Error(`Short code not found: "${code}"`);
    }

    return entry.longUrl;
  }
}
