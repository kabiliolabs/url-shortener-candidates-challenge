// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createStaticHandler } from "react-router";
import { baseUrl, shortenedUrls } from "@url-shortener/engine";
import { action, loader } from "./route";
import { loader as redirectLoader } from "../redirect/route";

const handler = createStaticHandler([
  { id: "home", path: "/", action, loader },
  {
    id: "redirect",
    path: "/s/:code",
    loader: (args) => {
      const code = args.params.code;
      if (code === undefined) throw new Error("Expected a code route parameter");
      return redirectLoader({ ...args, params: { code } });
    },
  },
]);
let originalEntries: [string, string][];

beforeEach(() => {
  originalEntries = [...shortenedUrls];
  shortenedUrls.clear();
  shortenedUrls.set("aa", "https://existing.example/path");
  shortenedUrls.set("bc", "https://another.example/path");
});

afterEach(() => {
  shortenedUrls.clear();
  for (const [code, destination] of originalEntries) {
    shortenedUrls.set(code, destination);
  }
  vi.restoreAllMocks();
});

async function submit(value?: string | File) {
  const body = new FormData();
  if (value !== undefined) body.set("url", value);
  return handler.query(new Request("http://localhost/", { method: "POST", body }));
}

describe("shortening route", () => {
  it("preserves successful response, loader prefix, and redirect behavior", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0.4);
    const destination = "https://example.com/article?ref=test#section";
    const result = await submit(destination);
    if (result instanceof Response) throw new Error("Expected action data");

    expect(result.statusCode).toBe(200);
    expect(result.actionData).toEqual({
      home: { shortenedUrl: `${baseUrl}/s/bb` },
    });
    expect(result.loaderData).toEqual({
      home: { baseUrl: baseUrl ? `${baseUrl}/s/` : "-" },
    });
    expect([...shortenedUrls]).toEqual([
      ["aa", "https://existing.example/path"],
      ["bc", "https://another.example/path"],
      ["bb", destination],
    ]);

    const redirect = await handler.query(new Request("http://localhost/s/bb"));
    expect(redirect).toBeInstanceOf(Response);
    if (redirect instanceof Response) {
      expect(redirect.status).toBe(302);
      expect(redirect.headers.get("Location")).toBe(destination);
    }
  });

  it("preserves the unknown-code response without changing storage", async () => {
    const entries = [...shortenedUrls];
    const result = await handler.query(new Request("http://localhost/s/missing"));
    if (result instanceof Response) throw new Error("Expected route error context");

    expect(result.statusCode).toBe(404);
    expect(result.errors?.redirect).toMatchObject({ status: 404, data: "Not Found" });
    expect([...shortenedUrls]).toEqual(entries);
  });

  it.each([
    [undefined, "required"],
    ["", "required"],
    ["  ", "required"],
    ["example.com", "invalid_url"],
    ["https://", "invalid_url"],
    ["https://exa mple.com", "invalid_url"],
    [new File(["https://example.com"], "url.txt"), "invalid_url"],
    ["ftp://example.com", "unsupported_protocol"],
    ["javascript:alert(1)", "unsupported_protocol"],
  ] as const)("rejects direct submission %j with %s before generation/storage", async (input, code) => {
    const entries = [...shortenedUrls];
    const random = vi.spyOn(Math, "random").mockReturnValue(0);
    const result = await submit(input);
    if (result instanceof Response) throw new Error("Expected validation action data");

    expect(result.statusCode).toBe(400);
    expect(result.actionData?.home).toEqual({ code, error: expect.any(String) });
    expect(result.errors).toBeNull();
    expect(random).not.toHaveBeenCalled();
    expect([...shortenedUrls]).toEqual(entries);
    if (code === "required") {
      expect(result.actionData?.home.error).toBe("URL is required");
    } else if (code === "invalid_url") {
      expect(result.actionData?.home.error).toBe(
        "Enter a complete, valid URL starting with http:// or https://.",
      );
    } else {
      expect(result.actionData?.home.error).toBe(
        "Only http:// and https:// URLs are supported.",
      );
    }
  });

  it("stores and resolves the trimmed destination without canonicalizing it", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0.4);
    const destination = "https://EXAMPLE.com:443/a/../path?ref=%61#section";
    const result = await submit(`  ${destination}  `);
    if (result instanceof Response) throw new Error("Expected action data");

    expect(result.statusCode).toBe(200);
    expect(shortenedUrls.get("bb")).toBe(destination);
    const redirect = await handler.query(new Request("http://localhost/s/bb"));
    expect(redirect).toBeInstanceOf(Response);
    if (redirect instanceof Response) {
      expect(redirect.headers.get("Location")).toBe(destination);
    }
  });
});
