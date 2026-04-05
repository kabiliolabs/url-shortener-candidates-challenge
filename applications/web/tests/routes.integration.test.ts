import { beforeEach, describe, expect, it, vi } from "vitest";
import { createInMemoryRepository } from "./helpers/in-memory-repository";

const repository = createInMemoryRepository();

vi.mock("~/infrastructure/prisma-shortened-url.repository.server", () => ({
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
    expect(shortenedUrl).toMatch(
      /^http:\/\/test\.example\/s\/[abc]{2}$/,
    );
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

describe("short code redirect route", () => {
  beforeEach(async () => {
    await resetWithPublicUrl("http://test.example");
  });

  it("redirects when code exists", async () => {
    await repository.create({
      code: "aa",
      originalUrl: "https://example.com",
    });
    const { loader } = await import("../app/routes/s.$code");
    const response = await loader({
      request: new Request("http://test.example/s/aa"),
      params: { code: "aa" },
    } as Parameters<typeof loader>[0]);
    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("https://example.com");
  });

  it("throws 404 Response when code is unknown", async () => {
    const { loader } = await import("../app/routes/s.$code");
    const args = {
      request: new Request("http://test.example/s/nope"),
      params: { code: "nope" },
    } as Parameters<typeof loader>[0];
    try {
      await loader(args);
      expect.fail("expected loader to throw");
    } catch (e) {
      expect(e).toBeInstanceOf(Response);
      const res = e as Response;
      expect(res.status).toBe(404);
      expect(await res.text()).toBe("Not Found");
    }
  });

  it("increments click count on redirect", async () => {
    await repository.create({
      code: "bb",
      originalUrl: "https://example.com/clicked",
    });
    const { loader } = await import("../app/routes/s.$code");
    await loader({
      request: new Request("http://test.example/s/bb"),
      params: { code: "bb" },
    } as Parameters<typeof loader>[0]);

    const record = await repository.findByCode("bb");
    expect(record?.clicks).toBe(1);
  });
});
