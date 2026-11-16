import { describe, expect, it, vi } from "vitest";
import { shortenerApp } from "@url-shortener/engine";
import { action, headers } from "./_index";
import type { Route } from "./+types/_index";

function postRequest(
  fields: Record<string, string>,
  headers: Record<string, string> = {},
) {
  const body = new URLSearchParams(fields);
  return new Request("http://localhost/", {
    method: "POST",
    body,
    headers: { "Content-Type": "application/x-www-form-urlencoded", ...headers },
  });
}

describe("POST /", () => {
  it("returns a shortened URL for a valid URL", async () => {
    const result = await action({
      request: postRequest({ url: "https://example.com" }),
    } as Route.ActionArgs);

    expect(result).toHaveProperty("shortenedUrl");
    expect(typeof (result as { shortenedUrl: string }).shortenedUrl).toBe(
      "string",
    );
  });

  it("returns the structured error-handling shape when URL is missing", async () => {
    const result = (await action({
      request: postRequest({}),
    } as Route.ActionArgs)) as Response;

    expect(result.status).toBe(400);
    const body = await result.json();
    expect(body).toEqual({
      error: { code: "INVALID_URL", message: "URL is required" },
    });
  });

  it("responds 429 with Retry-After once a client exceeds the rate limit", async () => {
    const send = () =>
      action({
        request: postRequest(
          { url: "ftp://rate-limited.example" },
          { "X-Forwarded-For": "198.51.100.42" },
        ),
      } as Route.ActionArgs) as Promise<Response>;

    for (let i = 0; i < 20; i++) {
      expect((await send()).status).toBe(400);
    }
    const limited = await send();

    expect(limited.status).toBe(429);
    expect(Number(limited.headers.get("Retry-After"))).toBeGreaterThan(0);
    expect((await limited.json()).error).toMatchObject({
      code: "RATE_LIMITED",
      message: expect.stringMatching(/^Too many requests\. Try again in \d+ seconds\.$/),
    });
    expect(
      headers({ actionHeaders: limited.headers } as Route.HeadersArgs),
    ).toEqual({ "Retry-After": limited.headers.get("Retry-After") });
  });

  it("rejects an oversized body with 413 without processing it", async () => {
    const execute = vi.spyOn(shortenerApp.shortenUrl, "execute");

    const result = (await action({
      request: postRequest(
        { url: `https://example.com/${"a".repeat(10_000)}` },
        { "X-Forwarded-For": "198.51.100.43" },
      ),
    } as Route.ActionArgs)) as Response;

    expect(result.status).toBe(413);
    expect((await result.json()).error.code).toBe("PAYLOAD_TOO_LARGE");
    expect(execute).not.toHaveBeenCalled();
    execute.mockRestore();
  });

  it("rejects an invalid URL with a 400 structured error", async () => {
    const result = (await action({
      request: postRequest({ url: "javascript:alert(1)" }),
    } as Route.ActionArgs)) as Response;

    expect(result.status).toBe(400);
    expect(await result.json()).toEqual({
      error: {
        code: "INVALID_URL",
        message: "Only http and https URLs are allowed",
      },
    });
  });
});
