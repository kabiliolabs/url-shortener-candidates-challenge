import { beforeEach, describe, expect, it, vi } from "vitest";
import { createInMemoryRepository } from "./helpers/in-memory-repository";
import { buildShortCodePattern } from "./helpers/short-code-pattern";

const repository = createInMemoryRepository();

vi.mock("@url-shortener/engine/server", () => ({
  shortenedUrlRepository: repository,
  createPrismaRepository: () => repository,
}));

async function resetWithPublicUrl(url: string) {
  vi.resetModules();
  process.env.PUBLIC_URL = url;
  repository.records.clear();
}

describe("index route handlers", () => {
  beforeEach(async () => {
    await resetWithPublicUrl("http://test.example");
  });

  it("loader returns baseUrl with /s/ when PUBLIC_URL is set", async () => {
    const { loader } = await import("../app/routes/_index");
    expect(loader()).toEqual({ baseUrl: "http://test.example/s/" });
  });

  it("action rejects missing url", async () => {
    const { action } = await import("../app/routes/_index");
    const formData = new FormData();
    const request = new Request("http://test.example/", {
      method: "POST",
      body: formData,
    });
    const result = await action({ request } as Parameters<typeof action>[0]);
    expect(result).toEqual({ error: "URL is required" });
  });

  it("action rejects empty url", async () => {
    const { action } = await import("../app/routes/_index");
    const formData = new FormData();
    formData.set("url", "");
    const request = new Request("http://test.example/", {
      method: "POST",
      body: formData,
    });
    const result = await action({ request } as Parameters<typeof action>[0]);
    expect(result).toEqual({ error: "URL is required" });
  });

  it("action stores url and returns shortenedUrl matching current code shape", async () => {
    const { action } = await import("../app/routes/_index");
    const longUrl = "https://example.com/page";
    const formData = new FormData();
    formData.set("url", longUrl);
    const request = new Request("http://test.example/", {
      method: "POST",
      body: formData,
    });
    const result = await action({ request } as Parameters<typeof action>[0]);
    expect(result).toMatchObject({ shortenedUrl: expect.any(String) });
    if (
      !result ||
      typeof result !== "object" ||
      !("shortenedUrl" in result) ||
      typeof result.shortenedUrl !== "string"
    ) {
      throw new Error("expected shortenedUrl");
    }
    const shortenedUrl = result.shortenedUrl;
    const codePattern = buildShortCodePattern("http://test.example/s/");
    expect(shortenedUrl).toMatch(codePattern);
    const code = shortenedUrl.split("/").pop()!;
    const stored = await repository.findByCode(code);
    expect(stored?.originalUrl).toBe(longUrl);
  });
});

describe("index route loader without PUBLIC_URL", () => {
  beforeEach(async () => {
    vi.resetModules();
    delete process.env.PUBLIC_URL;
    repository.records.clear();
  });

  it("loader returns '-' for baseUrl", async () => {
    const { loader } = await import("../app/routes/_index");
    expect(loader()).toEqual({ baseUrl: "-" });
  });
});
