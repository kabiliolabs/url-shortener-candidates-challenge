import { describe, expect, it } from "vitest";
import { prisma, shortenerApp } from "@url-shortener/engine";
import { loader } from "./s.$code";
import type { Route } from "./+types/s.$code";

function resolve(code: string) {
  return loader({
    params: { code },
    request: new Request(`http://localhost/s/${code}`),
  } as Route.LoaderArgs) as Promise<Response>;
}

async function storedClicks(code: string) {
  const record = await prisma.shortUrl.findUniqueOrThrow({ where: { code } });
  return record.clicks;
}

describe("GET /s/:code", () => {
  it("redirects with 302 and increments the stored click count by 1", async () => {
    const shortUrl = await shortenerApp.shortenUrl.execute(
      "https://example.com",
    );

    const result = await resolve(shortUrl.code);

    expect(result.status).toBe(302);
    expect(result.headers.get("Location")).toBe("https://example.com");
    expect(await storedClicks(shortUrl.code)).toBe(1);
  });

  it("returns 404 for an unknown code", async () => {
    await expect(resolve("does-not-exist")).rejects.toMatchObject({
      status: 404,
    });
  });

  it("counts every one of N concurrent resolutions", async () => {
    const shortUrl = await shortenerApp.shortenUrl.execute(
      "https://example.com/concurrent",
    );
    const resolutions = 25;

    const results = await Promise.all(
      Array.from({ length: resolutions }, () => resolve(shortUrl.code)),
    );

    expect(results.every((result) => result.status === 302)).toBe(true);
    expect(await storedClicks(shortUrl.code)).toBe(resolutions);
  });
});
