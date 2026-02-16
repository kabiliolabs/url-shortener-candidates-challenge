import { describe, it, expect } from "vitest";
import { SHORTEN_BODY_ERRORS } from "./parse-shorten-body.server.js";
import { parseShortenBody } from "./parse-shorten-body.server.js";

function requestWithBody(body: unknown): Request {
  return new Request("http://test/api/shorten", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function requestWithInvalidJson(): Request {
  return new Request("http://test/api/shorten", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "not json {",
  });
}

describe("parse-shorten-body.server", () => {
  it("returns url when body has valid url string", async () => {
    const req = requestWithBody({ url: "https://example.com" });
    const result = await parseShortenBody(req);
    expect(result).toEqual({ url: "https://example.com" });
  });

  it("trims url from body", async () => {
    const result = await parseShortenBody(
      requestWithBody({ url: "  https://example.com  " })
    );
    expect(result).toEqual({ url: "https://example.com" });
  });

  it("returns error for invalid JSON", async () => {
    const result = await parseShortenBody(requestWithInvalidJson());
    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error.status).toBe(400);
      const text = await result.error.text();
      expect(text).toContain(SHORTEN_BODY_ERRORS.INVALID_JSON);
    }
  });

  it("returns error when body is not an object", async () => {
    const result = await parseShortenBody(requestWithBody(null));
    expect("error" in result).toBe(true);
    if ("error" in result) expect(result.error.status).toBe(400);

    const arr = await parseShortenBody(requestWithBody([]));
    expect("error" in arr).toBe(true);
  });

  it("returns error when url is missing", async () => {
    const result = await parseShortenBody(requestWithBody({}));
    expect("error" in result).toBe(true);
    if ("error" in result) {
      const text = await result.error.text();
      expect(text).toContain(SHORTEN_BODY_ERRORS.MISSING_URL);
    }
  });

  it("returns error when url is empty or whitespace", async () => {
    const empty = await parseShortenBody(requestWithBody({ url: "" }));
    expect("error" in empty).toBe(true);
    const spaces = await parseShortenBody(requestWithBody({ url: "   " }));
    expect("error" in spaces).toBe(true);
  });

  it("returns error when url is not a string", async () => {
    const result = await parseShortenBody(requestWithBody({ url: 123 }));
    expect("error" in result).toBe(true);
    if ("error" in result) {
      const text = await result.error.text();
      expect(text).toContain(SHORTEN_BODY_ERRORS.EMPTY_URL);
    }
  });
});
