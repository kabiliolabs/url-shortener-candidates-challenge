import { ShortUrlNotFoundError } from "../../domain/errors";
import { ShortCode } from "../../domain/short-code";
import type { ShortUrl } from "../../domain/short-url";
import type { UrlRepository } from "../ports/url-repository";

type ResolveShortUrlInput = {
  code: string;
};

export class ResolveShortUrl {
  constructor(private readonly repository: UrlRepository) {}

  async execute(input: ResolveShortUrlInput): Promise<ShortUrl> {
    const code = ShortCode.create(input.code);
    const record = await this.repository.findAndIncrementClicks(code.value);

    if (!record) {
      throw new ShortUrlNotFoundError(code.value);
    }

    return record;
  }
}
