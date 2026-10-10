import {
  Click,
  ShortCode,
  type ClickRepository,
  type ShortLinkRepository,
} from "../../domain";
import { ShortLinkNotFoundError } from "../errors/short-link-not-found.error";
import type { Clock } from "../ports/clock";
import type { Logger } from "../ports/logger";

export interface ResolveShortLinkInput {
  code: string;
}

export interface ResolveShortLinkOutput {
  destination: string;
}

export interface ResolveShortLinkDependencies {
  shortLinkRepository: ShortLinkRepository;
  clickRepository: ClickRepository;
  clock: Clock;
  logger: Logger;
}

export class ResolveShortLink {
  private readonly shortLinkRepository: ShortLinkRepository;
  private readonly clickRepository: ClickRepository;
  private readonly clock: Clock;
  private readonly logger: Logger;

  constructor(dependencies: ResolveShortLinkDependencies) {
    this.shortLinkRepository = dependencies.shortLinkRepository;
    this.clickRepository = dependencies.clickRepository;
    this.clock = dependencies.clock;
    this.logger = dependencies.logger;
  }

  async execute(input: ResolveShortLinkInput): Promise<ResolveShortLinkOutput> {
    const shortCode = new ShortCode(input.code);
    const link = await this.shortLinkRepository.findByCode(shortCode);
    if (link === null) {
      throw new ShortLinkNotFoundError(shortCode);
    }

    const click = Click.record({ shortCode, occurredAt: this.clock.now() });

    // Redirecting is the core purpose: a lost click is tolerable, a broken link is not.
    // Only the write is degraded; anything else must still surface.
    try {
      await this.clickRepository.record(click);
    } catch (error) {
      this.logger.error("Failed to record click", {
        code: shortCode.value,
        error,
      });
    }

    return { destination: link.destination.value };
  }
}
