import { execFileSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const engineDir = path.resolve(__dirname, "../../../../libs/engine");
const prismaBin = path.join(engineDir, "node_modules/.bin/prisma");
const testDbFile = path.join(engineDir, "prisma/test-code-route.db");
const testDbUrl = `file:${testDbFile}`;

let loader: typeof import("./s.$code").loader;
let shortUrlService: typeof import("~/lib/short-url-service.server").shortUrlService;

beforeAll(async () => {
  execFileSync(prismaBin, ["db", "push", "--skip-generate"], {
    cwd: engineDir,
    env: { ...process.env, DATABASE_URL: testDbUrl },
    stdio: "pipe",
  });
  process.env.DATABASE_URL = testDbUrl;
  ({ loader } = await import("./s.$code"));
  ({ shortUrlService } = await import("~/lib/short-url-service.server"));
});

afterAll(() => {
  for (const file of [testDbFile, `${testDbFile}-journal`]) {
    if (existsSync(file)) rmSync(file);
  }
});

describe("s.$code route loader", () => {
  it("redirects to the destination and increments click stats for a known code", async () => {
    const { shortUrl } = await shortUrlService.createShortUrl(
      "https://example.com/known-code-test",
      "http://localhost:5173",
    );

    const response = (await loader({
      request: new Request(`http://localhost/s/${shortUrl.code}`),
      params: { code: shortUrl.code },
      context: {},
    } as never)) as Response;

    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(
      "https://example.com/known-code-test",
    );

    const urls = await shortUrlService.listShortUrls();
    const updated = urls.find((u) => u.code === shortUrl.code);
    expect(updated?.clickCount).toBe(1);
    expect(updated?.lastClickedAt).not.toBeNull();
  });

  it("throws a 404 Response for an unknown code, without changing any stats", async () => {
    const before = await shortUrlService.listShortUrls();

    await expect(
      loader({
        request: new Request("http://localhost/s/doesnotexist"),
        params: { code: "doesnotexist" },
        context: {},
      } as never),
    ).rejects.toMatchObject({ status: 404 });

    const after = await shortUrlService.listShortUrls();
    expect(after).toEqual(before);
  });
});
