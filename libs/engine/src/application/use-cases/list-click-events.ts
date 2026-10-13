import { ShortCode } from "../../domain/short-code";
import type { ClickEvent } from "../../domain/click-event";
import type { UrlRepository } from "../ports/url-repository";

export class ListClickEvents {
  constructor(private readonly repository: UrlRepository) {}

  async execute(input: { code: string }): Promise<ClickEvent[]> {
    const code = ShortCode.create(input.code);
    return this.repository.listClickEvents(code.value);
  }
}
