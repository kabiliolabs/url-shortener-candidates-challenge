import { describe, expect, it } from "vitest";
import {
  Click,
  DestinationUrl,
  ShortCode,
  ShortLink,
  type ClickRepository,
  type ShortLinkRepository,
} from "../../domain";
import { ShortLinkNotFoundError } from "../errors/short-link-not-found.error";
import type { Clock } from "../ports/clock";
import type { Logger } from "../ports/logger";
import { ResolveShortLink } from "./resolve-short-link";

const NOW = new Date("2026-02-03T04:05:06.000Z");
const CREATED = new Date("2026-01-01T00:00:00.000Z");

class FakeShortLinkRepository implements ShortLinkRepository {
  lookups: ShortCode[] = [];
  constructor(
    private readonly links: ShortLink[],
    private readonly failure?: Error,
  ) {}
  async save(): Promise<void> {}
  async findByCode(code: ShortCode): Promise<ShortLink | null> {
    if (this.failure) throw this.failure;
    this.lookups.push(code);
    return this.links.find((link) => link.code.equals(code)) ?? null;
  }
}

class FakeClickRepository implements ClickRepository {
  clicks: Click[] = [];
  constructor(private readonly failure?: Error) {}
  async record(click: Click): Promise<void> {
    if (this.failure) throw this.failure;
    this.clicks.push(click);
  }
}

class FakeLogger implements Logger {
  errors: { message: string; context?: Record<string, unknown> }[] = [];
  error(message: string, context?: Record<string, unknown>): void {
    this.errors.push({ message, context });
  }
}

function linkFor(code: string, destination = "https://example.com/target"): ShortLink {
  return new ShortLink(new ShortCode(code), new DestinationUrl(destination), CREATED);
}

function build(
  options: { links?: ShortLink[]; lookupFailure?: Error; clickFailure?: Error; clock?: Clock } = {},
) {
  const shortLinkRepository = new FakeShortLinkRepository(options.links ?? [linkFor("abc1234")], options.lookupFailure);
  const clickRepository = new FakeClickRepository(options.clickFailure);
  const logger = new FakeLogger();
  const clock = options.clock ?? ({ now: () => NOW } satisfies Clock);
  const useCase = new ResolveShortLink({ shortLinkRepository, clickRepository, clock, logger });
  return { useCase, shortLinkRepository, clickRepository, logger };
}

describe("ResolveShortLink", () => {
  it("returns the destination and records a click at the current time", async () => {
    const { useCase, clickRepository } = build();

    const result = await useCase.execute({ code: "abc1234" });

    expect(result).toEqual({ destination: "https://example.com/target" });
    expect(clickRepository.clicks).toHaveLength(1);
    expect(clickRepository.clicks[0].shortCode.equals(new ShortCode("abc1234"))).toBe(true);
    expect(clickRepository.clicks[0].occurredAt).toEqual(NOW);
  });

  it("fails with not found for an unknown code and records no click", async () => {
    const { useCase, clickRepository } = build();

    await expect(useCase.execute({ code: "zzzzzzz" })).rejects.toBeInstanceOf(ShortLinkNotFoundError);
    expect(clickRepository.clicks).toHaveLength(0);
  });

  it("still redirects and logs the failure when the click cannot be recorded", async () => {
    const failure = new Error("db down");
    const { useCase, logger } = build({ clickFailure: failure });

    const result = await useCase.execute({ code: "abc1234" });

    expect(result.destination).toBe("https://example.com/target");
    expect(logger.errors).toHaveLength(1);
    expect(logger.errors[0].context).toEqual({ code: "abc1234", error: failure });
  });

  it("does not hide a lookup failure behind the click degradation", async () => {
    const failure = new Error("db down");
    const { useCase, clickRepository, logger } = build({ lookupFailure: failure });

    await expect(useCase.execute({ code: "abc1234" })).rejects.toBe(failure);
    expect(clickRepository.clicks).toHaveLength(0);
    expect(logger.errors).toHaveLength(0);
  });

  it("does not report a clock failure as a click recording failure", async () => {
    const failure = new Error("clock broken");
    const clock: Clock = {
      now: () => {
        throw failure;
      },
    };
    const { useCase, logger } = build({ clock });

    await expect(useCase.execute({ code: "abc1234" })).rejects.toBe(failure);
    expect(logger.errors).toHaveLength(0);
  });

  it("resolves codes that do not follow the current format", async () => {
    const { useCase, shortLinkRepository } = build({ links: [linkFor("legacy12", "https://legacy.example")] });

    const result = await useCase.execute({ code: "legacy12" });

    expect(result.destination).toBe("https://legacy.example");
    expect(shortLinkRepository.lookups[0].value).toBe("legacy12");
  });
});
