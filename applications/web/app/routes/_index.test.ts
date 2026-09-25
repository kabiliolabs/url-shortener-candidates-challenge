import { execFileSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const engineDir = path.resolve(__dirname, "../../../../libs/engine");
const prismaBin = path.join(engineDir, "node_modules/.bin/prisma");
const testDbFile = path.join(engineDir, "prisma/test-index-route.db");
const testDbUrl = `file:${testDbFile}`;

let action: typeof import("./_index").action;

beforeAll(async () => {
  execFileSync(prismaBin, ["db", "push", "--skip-generate"], {
    cwd: engineDir,
    env: { ...process.env, DATABASE_URL: testDbUrl },
    stdio: "pipe",
  });
  process.env.DATABASE_URL = testDbUrl;
  ({ action } = await import("./_index"));
});

afterAll(() => {
  for (const file of [testDbFile, `${testDbFile}-journal`]) {
    if (existsSync(file)) rmSync(file);
  }
});

function postRequest(url: string, clientKey: string) {
  const formData = new FormData();
  formData.set("url", url);
  return new Request("http://localhost/?index", {
    method: "POST",
    body: formData,
    headers: { "x-forwarded-for": clientKey },
  });
}

describe("_index route action", () => {
  it("creates a short url and returns it for a valid submission", async () => {
    const response = (await action({
      request: postRequest("https://example.com/integration-test", "test-happy"),
      params: {},
      context: {},
    } as never)) as { shortenedUrl?: string; error?: string };

    expect(response.error).toBeUndefined();
    expect(response.shortenedUrl).toMatch(/\/s\/[0-9A-Za-z]{7}$/);
  });

  it("returns a field error for an invalid submission, without creating an entry", async () => {
    const response = (await action({
      request: postRequest("javascript:alert(1)", "test-error"),
      params: {},
      context: {},
    } as never)) as { shortenedUrl?: string; error?: string };

    expect(response.shortenedUrl).toBeUndefined();
    expect(response.error).toBe("Only http:// and https:// URLs are allowed");
  });
});
