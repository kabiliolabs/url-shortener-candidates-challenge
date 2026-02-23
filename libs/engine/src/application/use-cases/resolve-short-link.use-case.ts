import { ShortCode } from "../../domain/value-objects/short-code.vo";
import { NotFoundError } from "../../shared/errors";
import type { ShortLinkRepositoryPort } from "../ports/short-link-repository.port";

export interface ResolveShortLinkInput {
  code: string;
}

export interface ResolveShortLinkResult {
  destinationUrl: string;
}

export class ResolveShortLinkUseCase {
  constructor(private readonly repository: ShortLinkRepositoryPort) {}

  async execute(input: ResolveShortLinkInput): Promise<ResolveShortLinkResult> {
    const code = ShortCode.create(input.code).value;

    const shortLink = await this.repository.findByCode(code);

    if (!shortLink) {
      throw new NotFoundError("Short URL not found.");
    }

    await this.repository.incrementClicks(code);

    return {
      destinationUrl: shortLink.originalUrl,
    };
  }
}
