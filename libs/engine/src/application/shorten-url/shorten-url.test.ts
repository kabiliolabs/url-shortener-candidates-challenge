import { describe, expect, it } from "vitest";
import {
  DestinationUrl,
  InvalidDestinationUrlError,
  ShortCode,
  ShortCodeAlreadyExistsError,
  type ShortCodeGenerator,
  type ShortLink,
  type ShortLinkRepository,
} from "../../domain";
import type { Clock } from "../ports/clock";
import { SelfReferencingUrlError } from "../errors/self-referencing-url.error";
import { ShortCodeGenerationExhaustedError } from "../errors/short-code-generation-exhausted.error";
import { ShortenUrl } from "./shorten-url";

const NOW = new Date("2026-01-02T03:04:05.000Z");

class FixedClock implements Clock {
  now(): Date {
    return NOW;
  }
}

class SequenceGenerator implements ShortCodeGenerator {
  private index = 0;
  constructor(private readonly codes: string[]) {}
  generate(): ShortCode {
    const code = this.codes[Math.min(this.index++, this.codes.length - 1)];
    return new ShortCode(code);
  }
}

class FakeShortLinkRepository implements ShortLinkRepository {
  saveAttempts = 0;
  saved: ShortLink[] = [];
  constructor(private readonly failures: Error[] = []) {}
  async save(link: ShortLink): Promise<void> {
    this.saveAttempts++;
    const failure = this.failures.shift();
    if (failure) throw failure;
    this.saved.push(link);
  }
  async findByCode(): Promise<ShortLink | null> {
    return null;
  }
}

const collision = (code: string) => new ShortCodeAlreadyExistsError(new ShortCode(code));

function build(options: {
  codes?: string[];
  failures?: Error[];
  maxAttempts?: number;
  ownHost?: string;
} = {}) {
  const clock = new FixedClock();
  const shortLinkRepository = new FakeShortLinkRepository(options.failures);
  const useCase = new ShortenUrl({
    shortLinkRepository,
    shortCodeGenerator: new SequenceGenerator(options.codes ?? ["abc1234"]),
    clock,
    ownHost: options.ownHost ?? "sho.rt",
    maxAttempts: options.maxAttempts,
  });
  return { useCase, shortLinkRepository };
}

describe("ShortenUrl", () => {
  it("returns the new short code with its destination", async () => {
    const { useCase, shortLinkRepository } = build();

    const result = await useCase.execute({ url: "https://example.com/page" });

    expect(result).toEqual({ code: "abc1234", destination: "https://example.com/page" });
    expect(shortLinkRepository.saved).toHaveLength(1);
    expect(shortLinkRepository.saved[0].createdAt).toEqual(NOW);
    expect(shortLinkRepository.saved[0].destination.equals(DestinationUrl.create("https://example.com/page"))).toBe(true);
  });

  it("returns the normalized destination that was actually stored", async () => {
    const { useCase } = build();

    const result = await useCase.execute({ url: "HTTPS://Example.com:443" });

    expect(result.destination).toBe("https://example.com/");
  });

  it("retries with a new code after a collision", async () => {
    const { useCase, shortLinkRepository } = build({
      codes: ["taken11", "free222"],
      failures: [collision("taken11")],
    });

    const result = await useCase.execute({ url: "https://example.com" });

    expect(result.code).toBe("free222");
    expect(shortLinkRepository.saveAttempts).toBe(2);
    expect(shortLinkRepository.saved[0].code.equals(new ShortCode("free222"))).toBe(true);
  });

  it("stops retrying when a collision is followed by another kind of failure", async () => {
    const boom = new Error("database down");
    const { useCase, shortLinkRepository } = build({
      codes: ["taken11", "free222"],
      failures: [collision("taken11"), boom],
    });

    await expect(useCase.execute({ url: "https://example.com" })).rejects.toBe(boom);
    expect(shortLinkRepository.saveAttempts).toBe(2);
  });

  it("gives up after the maximum number of attempts when every code collides", async () => {
    const failures = Array.from({ length: 10 }, () => collision("taken11"));
    const { useCase, shortLinkRepository } = build({ failures, maxAttempts: 3 });

    await expect(useCase.execute({ url: "https://example.com" })).rejects.toBeInstanceOf(
      ShortCodeGenerationExhaustedError,
    );
    expect(shortLinkRepository.saveAttempts).toBe(3);
  });

  it("reports the last collision as the cause when attempts run out", async () => {
    const last = collision("last111");
    const { useCase } = build({ failures: [collision("first11"), last], maxAttempts: 2 });

    await expect(useCase.execute({ url: "https://example.com" })).rejects.toMatchObject({
      cause: last,
    });
  });

  it("allows 5 attempts by default", async () => {
    const failures = Array.from({ length: 10 }, () => collision("taken11"));
    const { useCase, shortLinkRepository } = build({ failures });

    await expect(useCase.execute({ url: "https://example.com" })).rejects.toBeInstanceOf(
      ShortCodeGenerationExhaustedError,
    );
    expect(shortLinkRepository.saveAttempts).toBe(5);
  });

  it("does not retry when saving fails for a reason other than a collision", async () => {
    const boom = new Error("database down");
    const { useCase, shortLinkRepository } = build({ failures: [boom] });

    await expect(useCase.execute({ url: "https://example.com" })).rejects.toBe(boom);
    expect(shortLinkRepository.saveAttempts).toBe(1);
  });

  it("rejects an invalid destination URL", async () => {
    const { useCase, shortLinkRepository } = build();

    await expect(useCase.execute({ url: "not a url" })).rejects.toBeInstanceOf(InvalidDestinationUrlError);
    expect(shortLinkRepository.saveAttempts).toBe(0);
  });

  it.each([
    ["https://sho.rt/abc1234", "sho.rt"],
    ["https://SHO.RT/abc1234", "sho.rt"],
    ["http://Sho.Rt", "sho.rt"],
    ["https://sho.rt./x", "sho.rt"],
    ["https://sho.rt:8080/x", "sho.rt"],
    ["https://sho.rt/x", "SHO.RT"],
    ["https://sho.rt/x", "sho.rt."],
    ["http://sho.rt:4000/x", "sho.rt:3000"],
    ["https://sho.rt/x", "https://sho.rt"],
    ["https://sho.rt/x", "https://Sho.Rt:8443/"],
  ])("rejects a link to the service itself: %s (own host %s)", async (url, ownHost) => {
    const { useCase, shortLinkRepository } = build({ ownHost });

    await expect(useCase.execute({ url })).rejects.toBeInstanceOf(SelfReferencingUrlError);
    expect(shortLinkRepository.saveAttempts).toBe(0);
  });

  it.each([
    "https://www.sho.rt/x",
    "https://blog.sho.rt/x",
    "https://other.example/x",
    "https://sho.rt.example/x",
  ])("accepts a link to another host: %s", async (url) => {
    const { useCase } = build({ ownHost: "sho.rt" });

    await expect(useCase.execute({ url })).resolves.toMatchObject({ code: "abc1234" });
  });

  it.each(["", "   ", "http://", "::::"])("fails at construction for invalid own host %j", (ownHost) => {
    expect(() => build({ ownHost })).toThrow();
  });
});
