import { afterEach, describe, expect, it, vi } from "vitest";
import { shortenerApp } from "@url-shortener/engine";
import { loader } from "./api.urls";
import type { Route } from "./+types/api.urls";

async function getUrls(query = "") {
  const response = await loader({
    request: new Request(`http://localhost/api/urls${query}`),
  } as Route.LoaderArgs);
  return { status: response.status, body: await response.json() };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GET /api/urls", () => {
  it("returns URLs with code, original URL, clicks and creation date, bounded by the page size", async () => {
    const created = await shortenerApp.shortenUrl.execute(
      "https://example.com/listed",
    );

    const bounded = await getUrls("?limit=1");
    // Other test files insert concurrently, so look the record up instead of assuming it's first.
    const { status, body } = await getUrls("?limit=100");

    expect(bounded.body.limit).toBe(1);
    expect(bounded.body.urls).toHaveLength(1);
    expect(status).toBe(200);
    const listed = body.urls.find(
      (url: { code: string }) => url.code === created.code,
    );
    expect(listed).toMatchObject({
      code: created.code,
      originalUrl: "https://example.com/listed",
      clicks: 0,
      createdAt: created.createdAt.toISOString(),
    });
  });

  it("caps an oversized limit at the maximum page size", async () => {
    const { body } = await getUrls("?limit=100000");

    expect(body.limit).toBe(100);
    expect(body.urls.length).toBeLessThanOrEqual(100);
  });

  it("returns an empty list, not an error, when no URLs exist", async () => {
    vi.spyOn(shortenerApp.listUrlsWithStats, "execute").mockResolvedValue({
      urls: [],
      limit: 20,
      offset: 0,
      nextOffset: null,
    });

    const { status, body } = await getUrls();

    expect(status).toBe(200);
    expect(body).toEqual({ urls: [], limit: 20, offset: 0, nextOffset: null });
  });
});
