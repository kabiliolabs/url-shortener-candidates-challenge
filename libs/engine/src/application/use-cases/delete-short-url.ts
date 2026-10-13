import { ShortCode } from "../../domain/short-code";
import type { UrlRepository } from "../ports/url-repository";

export class DeleteShortUrl {
  constructor(private readonly repository: UrlRepository) {}

  async execute(input: { code: string }): Promise<boolean> {
    const code = ShortCode.create(input.code);
    return this.repository.delete(code.value);
  }
}
