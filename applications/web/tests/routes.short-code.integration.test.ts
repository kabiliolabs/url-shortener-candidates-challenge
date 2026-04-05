import { beforeEach, describe, expect, it, vi } from "vitest";
import { createInMemoryRepository } from "./helpers/in-memory-repository";

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
