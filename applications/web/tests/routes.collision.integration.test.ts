import { beforeEach, describe, expect, it, vi } from "vitest";
import { createInMemoryRepository } from "./helpers/in-memory-repository";

const repository = createInMemoryRepository();
const generatedCodeQueue = vi.hoisted(() => [] as string[]);

vi.mock("@url-shortener/engine", async () => {
  const actual = await vi.importActual<typeof import("@url-shortener/engine")>(
    "@url-shortener/engine",
  );

  return {
    ...actual,
    generateShortCode: () => generatedCodeQueue.shift() ?? actual.generateShortCode(),
  };
});

vi.mock("@url-shortener/engine/server", () => ({
  shortenedUrlRepository: repository,
  createPrismaRepository: () => repository,
}));

describe("index route collision handling", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.PUBLIC_URL = "http://test.example";
    repository.records.clear();
    generatedCodeQueue.length = 0;
  });

  it("retries when the first generated code collides", async () => {
    await repository.create({
      code: "taken",
      originalUrl: "https://existing.com/page",
    });
    generatedCodeQueue.push("taken", "fresh-code");

    const { action } = await import("../app/routes/_index");
    const formData = new FormData();
    formData.set("url", "https://new.example/page");

    const request = new Request("http://test.example/", {
      method: "POST",
      body: formData,
    });

    const result = await action({ request } as Parameters<typeof action>[0]);
    expect(result).toEqual({
      shortenedUrl: "http://test.example/s/fresh-code",
    });

    const oldRecord = await repository.findByCode("taken");
    const newRecord = await repository.findByCode("fresh-code");
    expect(oldRecord?.originalUrl).toBe("https://existing.com/page");
    expect(newRecord?.originalUrl).toBe("https://new.example/page");
  });
});
