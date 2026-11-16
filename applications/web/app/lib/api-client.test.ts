import { describe, expect, it, vi } from "vitest";
import { describeError, fetchUrlList, NETWORK_ERROR } from "./api-client";

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { "Content-Type": "application/json", ...init.headers },
  });
}

describe("describeError", () => {
  it("shows the domain's validation message as-is", () => {
    expect(
      describeError({ code: "INVALID_URL", message: "Only http and https URLs are allowed" }),
    ).toBe("Only http and https URLs are allowed");
  });

  it("tells the user when to retry after a rate limit", () => {
    expect(
      describeError({ code: "RATE_LIMITED", message: "x", retryAfterSeconds: 42 }),
    ).toBe("You're creating links too quickly. Try again in 42 seconds.");
    expect(describeError({ code: "RATE_LIMITED", message: "x" })).toMatch(/try again/i);
  });

  it("reports connectivity problems without a raw exception", () => {
    expect(describeError(NETWORK_ERROR)).toBe(
      "Can't reach the server. Check your connection and try again.",
    );
  });

  it("maps oversized and unexpected errors to generic messages", () => {
    expect(describeError({ code: "PAYLOAD_TOO_LARGE", message: "x" })).toBe(
      "That URL is too long to shorten.",
    );
    expect(
      describeError({ code: "INTERNAL_ERROR", message: "TypeError at line 3" }),
    ).toBe("Something went wrong on our side. Please try again.");
  });
});

describe("fetchUrlList", () => {
  it("returns the page on success", async () => {
    const page = {
      urls: [
        {
          code: "abc1234",
          shortUrl: "http://localhost:3000/s/abc1234",
          originalUrl: "https://example.com",
          clicks: 3,
          createdAt: "2026-11-16T10:00:00.000Z",
        },
      ],
      limit: 20,
      offset: 0,
      nextOffset: null,
    };
    const fetchImpl = vi.fn(async () => jsonResponse(page));

    expect(await fetchUrlList(undefined, fetchImpl)).toEqual({ ok: true, data: page });
    expect(fetchImpl).toHaveBeenCalledWith("/api/urls", expect.anything());
  });

  it("maps a structured error response, including Retry-After", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse(
        { error: { code: "RATE_LIMITED", message: "Too many requests." } },
        { status: 429, headers: { "Retry-After": "30" } },
      ),
    );

    expect(await fetchUrlList(undefined, fetchImpl)).toEqual({
      ok: false,
      error: { code: "RATE_LIMITED", message: "Too many requests.", retryAfterSeconds: 30 },
    });
  });

  it("maps a non-JSON server failure to an unknown error", async () => {
    const fetchImpl = vi.fn(
      async () => new Response("<html>", { status: 502, statusText: "Bad Gateway" }),
    );

    expect(await fetchUrlList(undefined, fetchImpl)).toEqual({
      ok: false,
      error: { code: "UNKNOWN", message: "Bad Gateway" },
    });
  });

  it("maps a network failure to NETWORK_ERROR", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    });

    expect(await fetchUrlList(undefined, fetchImpl)).toEqual({
      ok: false,
      error: NETWORK_ERROR,
    });
  });
});
