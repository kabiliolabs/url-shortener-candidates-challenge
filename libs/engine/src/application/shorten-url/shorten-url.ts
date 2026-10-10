import {
  DestinationUrl,
  ShortCodeAlreadyExistsError,
  ShortLink,
  type ShortCodeGenerator,
  type ShortLinkRepository,
} from "../../domain";
import { SelfReferencingUrlError } from "../errors/self-referencing-url.error";
import { ShortCodeGenerationExhaustedError } from "../errors/short-code-generation-exhausted.error";
import type { Clock } from "../ports/clock";

export interface ShortenUrlInput {
  url: string;
}

export interface ShortenUrlOutput {
  code: string;
  destination: string;
}

export interface ShortenUrlDependencies {
  shortLinkRepository: ShortLinkRepository;
  shortCodeGenerator: ShortCodeGenerator;
  clock: Clock;
  /** This service's host ("sho.rt", "localhost:3000" or "https://sho.rt"); links pointing back to it are rejected. */
  ownHost: string;
  maxAttempts?: number;
}

const DEFAULT_MAX_ATTEMPTS = 5;

export class ShortenUrl {
  private readonly shortLinkRepository: ShortLinkRepository;
  private readonly shortCodeGenerator: ShortCodeGenerator;
  private readonly clock: Clock;
  private readonly ownHost: string;
  private readonly maxAttempts: number;

  constructor(dependencies: ShortenUrlDependencies) {
    this.shortLinkRepository = dependencies.shortLinkRepository;
    this.shortCodeGenerator = dependencies.shortCodeGenerator;
    this.clock = dependencies.clock;
    this.ownHost = parseOwnHost(dependencies.ownHost);
    this.maxAttempts = dependencies.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  }

  async execute(input: ShortenUrlInput): Promise<ShortenUrlOutput> {
    const destination = DestinationUrl.create(input.url);

    // Policy: the port is ignored (any port on our host is a self-link); subdomains are allowed.
    if (normalizeHost(new URL(destination.value).hostname) === this.ownHost) {
      throw new SelfReferencingUrlError(this.ownHost);
    }

    const createdAt = this.clock.now();

    let lastCollision: ShortCodeAlreadyExistsError | undefined;
    for (let attempt = 0; attempt < this.maxAttempts; attempt++) {
      const link = ShortLink.create({
        code: this.shortCodeGenerator.generate(),
        destination,
        createdAt,
      });
      try {
        await this.shortLinkRepository.save(link);
        return { code: link.code.value, destination: link.destination.value };
      } catch (error) {
        if (!(error instanceof ShortCodeAlreadyExistsError)) throw error;
        lastCollision = error;
      }
    }

    throw new ShortCodeGenerationExhaustedError(this.maxAttempts, { cause: lastCollision });
  }
}

function normalizeHost(hostname: string): string {
  const lower = hostname.toLowerCase();
  return lower.endsWith(".") ? lower.slice(0, -1) : lower;
}

// Fails fast at construction: a misconfigured guard must never silently turn off.
function parseOwnHost(raw: string): string {
  const value = raw.trim();
  let hostname = "";
  try {
    hostname = new URL(value.includes("://") ? value : `http://${value}`).hostname;
  } catch {
    // handled below
  }
  const host = normalizeHost(hostname);
  if (host.length === 0) {
    throw new Error(`Invalid ownHost configuration: "${raw}"`);
  }
  return host;
}
