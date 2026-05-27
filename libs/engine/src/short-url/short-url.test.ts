import { describe, expect, it } from "vitest";
import {
  createShortCode,
  createShortUrl,
  resolveShortUrl,
  ShortUrlError,
  type CodeGenerator,
  type ShortCode,
  type ShortUrl,
  type ShortUrlRepository,
} from "./index";

class InMemoryShortUrlRepository implements ShortUrlRepository {
  private readonly shortUrls = new Map<ShortCode, ShortUrl>();

  constructor(shortUrls: ShortUrl[] = []) {
    for (const shortUrl of shortUrls) {
      this.shortUrls.set(shortUrl.code, shortUrl);
    }
  }

  async findByCode(code: ShortCode): Promise<ShortUrl | null> {
    return this.shortUrls.get(code) ?? null;
  }

  async findAll(): Promise<ShortUrl[]> {
    return Array.from(this.shortUrls.values());
  }

  async save(shortUrl: ShortUrl): Promise<void> {
    this.shortUrls.set(shortUrl.code, shortUrl);
  }

  async incrementClicks(code: ShortCode): Promise<void> {
    const shortUrl = this.shortUrls.get(code);

    if (!shortUrl) {
      return;
    }

    this.shortUrls.set(code, {
      ...shortUrl,
      clickCount: shortUrl.clickCount + 1,
      updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    });
  }
}

class SequenceCodeGenerator implements CodeGenerator {
  private index = 0;

  constructor(private readonly codes: string[]) {}

  generate(): string {
    const code = this.codes[this.index];
    this.index += 1;

    if (!code) {
      throw new Error("No more test codes available");
    }

    return code;
  }
}

function createExistingShortUrl(overrides: Partial<ShortUrl> = {}): ShortUrl {
  return {
    code: createShortCode("EXIST1"),
    originalUrl: "https://example.com/" as ShortUrl["originalUrl"],
    clickCount: 0,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

describe("createShortUrl", () => {
  it("rejects invalid original URLs", async () => {
    await expect(
      createShortUrl(
        { originalUrl: "not-a-url" },
        {
          repository: new InMemoryShortUrlRepository(),
          codeGenerator: new SequenceCodeGenerator(["CODE1"]),
        },
      ),
    ).rejects.toMatchObject({
      code: "invalid_original_url",
    } satisfies Partial<ShortUrlError>);
  });

  it("creates a short URL with a normalized original URL", async () => {
    const repository = new InMemoryShortUrlRepository();

    const shortUrl = await createShortUrl(
      { originalUrl: "https://example.com" },
      {
        repository,
        codeGenerator: new SequenceCodeGenerator(["CODE1"]),
        now: () => new Date("2026-01-01T00:00:00.000Z"),
      },
    );

    expect(shortUrl).toMatchObject({
      code: "CODE1",
      originalUrl: "https://example.com/",
      clickCount: 0,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    });
    await expect(repository.findByCode(shortUrl.code)).resolves.toEqual(
      shortUrl,
    );
  });

  it("rejects original URLs with unsupported control characters", async () => {
    await expect(
      createShortUrl(
        { originalUrl: "https://example.com/a\tb" },
        {
          repository: new InMemoryShortUrlRepository(),
          codeGenerator: new SequenceCodeGenerator(["CODE1"]),
        },
      ),
    ).rejects.toMatchObject({
      code: "invalid_original_url",
      message: "URL contains unsupported characters",
    } satisfies Partial<ShortUrlError>);
  });

  it("retries when generated codes collide", async () => {
    const repository = new InMemoryShortUrlRepository([
      createExistingShortUrl({ code: createShortCode("TAKEN1") }),
    ]);

    const shortUrl = await createShortUrl(
      { originalUrl: "https://example.com" },
      {
        repository,
        codeGenerator: new SequenceCodeGenerator(["TAKEN1", "UNIQUE1"]),
      },
    );

    expect(shortUrl.code).toBe("UNIQUE1");
  });
});

describe("resolveShortUrl", () => {
  it("resolves an existing short URL and increments clicks", async () => {
    const repository = new InMemoryShortUrlRepository([
      createExistingShortUrl({ clickCount: 2 }),
    ]);

    const shortUrl = await resolveShortUrl(
      { code: "EXIST1" },
      { repository },
    );

    expect(shortUrl.originalUrl).toBe("https://example.com/");
    expect(shortUrl.clickCount).toBe(3);
    await expect(repository.findByCode(shortUrl.code)).resolves.toMatchObject({
      clickCount: 3,
    });
  });

  it("rejects missing short codes", async () => {
    await expect(
      resolveShortUrl(
        { code: "MISS1" },
        { repository: new InMemoryShortUrlRepository() },
      ),
    ).rejects.toMatchObject({
      code: "short_url_not_found",
    } satisfies Partial<ShortUrlError>);
  });
});
