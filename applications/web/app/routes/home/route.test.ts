// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createStaticHandler } from "react-router";
import { baseUrl } from "@url-shortener/engine";
import { action, loader } from "./route";
import { loader as redirectLoader } from "../redirect/route";

const handler = createStaticHandler([
  { id: "home", path: "/", action, loader },
  {
    id: "redirect",
    path: "/s/:code",
    loader: (args) => {
      const code = args.params.code;
      if (code === undefined)
        throw new Error("Expected a code route parameter");
      return redirectLoader({ ...args, params: { code } });
    },
  },
]);
const state = vi.hoisted(() => ({
  mode: "normal",
  records: new Map<string, string>(),
  generate: vi.fn(() => "NewCode001"),
}));
const shortenedUrls = state.records;
vi.mock("../../bootstrap.server", async () => {
  const {
    Err,
    Ok,
    ShortenedURL,
    ShortenURLUseCase,
    ResolveShortenedURLUseCase,
  } = await import("@url-shortener/engine");
  const repository = {
    async insert(link: import("@url-shortener/engine").ShortenedURL) {
      if (state.mode === "outage")
        return Err({ code: "storage_unavailable" as const });
      if (state.mode === "collisions" || state.records.has(link.code))
        return Err({ code: "code_conflict" as const });
      state.records.set(link.code, link.destination.value);
      return Ok(undefined);
    },
    async findByCode(
      code: string,
    ): Promise<
      import("@url-shortener/engine").Result<
        import("@url-shortener/engine").ShortenedURL | null,
        { code: "storage_unavailable" }
      >
    > {
      if (state.mode === "outage")
        return Err({ code: "storage_unavailable" as const });
      const raw = state.records.get(code);
      if (raw === undefined) return Ok(null);
      const parsed = ShortenedURL.parseDestination(raw);
      if (!parsed.ok) throw new Error("Invalid fixture");
      const link = ShortenedURL.create(code, parsed.value);
      if (!link.ok) throw new Error("Invalid fixture");
      return link;
    },
  };
  return {
    shortenURL: new ShortenURLUseCase({ generate: state.generate }, repository),
    resolveShortenedURL: new ResolveShortenedURLUseCase(repository),
  };
});
let originalEntries: [string, string][];

beforeEach(() => {
  state.mode = "normal";
  state.generate.mockReset().mockReturnValue("NewCode001");
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
  return handler.query(
    new Request("http://localhost/", { method: "POST", body }),
  );
}

describe("shortening route", () => {
  it("preserves successful response, loader prefix, and redirect behavior", async () => {
    state.generate.mockReturnValue("NewCode001");
    const destination = "https://example.com/article?ref=test#section";
    const result = await submit(destination);
    if (result instanceof Response) throw new Error("Expected action data");

    expect(result.statusCode).toBe(200);
    expect(result.actionData).toEqual({
      home: { shortenedUrl: `${baseUrl}/s/NewCode001` },
    });
    expect(result.loaderData).toEqual({
      home: { baseUrl: baseUrl ? `${baseUrl}/s/` : "-" },
    });
    expect([...shortenedUrls]).toEqual([
      ["aa", "https://existing.example/path"],
      ["bc", "https://another.example/path"],
      ["NewCode001", destination],
    ]);

    const redirect = await handler.query(
      new Request("http://localhost/s/NewCode001"),
    );
    expect(redirect).toBeInstanceOf(Response);
    if (redirect instanceof Response) {
      expect(redirect.status).toBe(302);
      expect(redirect.headers.get("Location")).toBe(destination);
    }
  });

  it("preserves the unknown-code response without changing storage", async () => {
    const entries = [...shortenedUrls];
    const result = await handler.query(
      new Request("http://localhost/s/missing"),
    );
    if (result instanceof Response)
      throw new Error("Expected route error context");

    expect(result.statusCode).toBe(404);
    expect(result.errors?.redirect).toMatchObject({
      status: 404,
      data: "Not Found",
    });
    expect([...shortenedUrls]).toEqual(entries);
  });

  it("rejects a whitespace-only code with HTTP 400 without changing storage", async () => {
    const entries = [...shortenedUrls];
    const random = state.generate;
    const result = await handler.query(
      new Request("http://localhost/s/%20%20"),
    );
    if (result instanceof Response)
      throw new Error("Expected route error context");

    expect(result.statusCode).toBe(400);
    expect(result.errors?.redirect).toMatchObject({
      status: 400,
      data: "Invalid short code",
    });
    expect([...shortenedUrls]).toEqual(entries);
    expect(random).not.toHaveBeenCalled();
  });

  it("looks up exact codes without enforcing the generator's alphabet or length", async () => {
    const code = "Custom-42";
    const destination = "https://example.com/custom";
    shortenedUrls.set(code, destination);
    const entries = [...shortenedUrls];
    const random = state.generate;
    const result = await handler.query(
      new Request(`http://localhost/s/${code}`),
    );
    if (!(result instanceof Response))
      throw new Error("Expected redirect response");

    expect(result.status).toBe(302);
    expect(result.headers.get("Location")).toBe(destination);
    expect([...shortenedUrls]).toEqual(entries);
    expect(random).not.toHaveBeenCalled();
  });

  it("does not trim codes or add a route for a missing code segment", async () => {
    const entries = [...shortenedUrls];
    const spaced = await handler.query(
      new Request("http://localhost/s/%20aa%20"),
    );
    if (spaced instanceof Response)
      throw new Error("Expected route error context");
    expect(spaced.statusCode).toBe(404);
    expect(spaced.errors?.redirect).toMatchObject({
      status: 404,
      data: "Not Found",
    });

    const missing = await handler.query(new Request("http://localhost/s/"));
    if (missing instanceof Response)
      throw new Error("Expected route error context");
    expect(missing.statusCode).toBe(404);
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
    ["sftp://example.com/file", "unsupported_protocol"],
    ["mailto:person@example.com", "unsupported_protocol"],
    ["ftp://", "unsupported_protocol"],
    ["https:example.com", "invalid_url"],
    ["https:/example.com", "invalid_url"],
  ] as const)(
    "rejects direct submission %j with %s before generation/storage",
    async (input, code) => {
      const entries = [...shortenedUrls];
      const random = state.generate;
      const result = await submit(input);
      if (result instanceof Response)
        throw new Error("Expected validation action data");

      expect(result.statusCode).toBe(400);
      expect(result.actionData?.home).toEqual({
        code,
        error: expect.any(String),
      });
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
    },
  );

  it("stores and resolves the trimmed destination without canonicalizing it", async () => {
    state.generate.mockReturnValue("NewCode001");
    const destination = "https://EXAMPLE.com:443/a/../path?ref=%61#section";
    const result = await submit(`  ${destination}  `);
    if (result instanceof Response) throw new Error("Expected action data");

    expect(result.statusCode).toBe(200);
    expect(shortenedUrls.get("NewCode001")).toBe(destination);
    const redirect = await handler.query(
      new Request("http://localhost/s/NewCode001"),
    );
    expect(redirect).toBeInstanceOf(Response);
    if (redirect instanceof Response) {
      expect(redirect.headers.get("Location")).toBe(destination);
    }
  });
  it.each([
    [
      "collisions",
      "code_exhausted",
      "Could not create a short link. Please try again.",
    ],
    [
      "outage",
      "storage_unavailable",
      "Service temporarily unavailable. Please try again.",
    ],
  ])("maps %s to safe HTTP 503 action data", async (mode, code, error) => {
    state.mode = mode;
    const before = [...shortenedUrls];
    const result = await submit("https://example.com");
    if (result instanceof Response) throw new Error("Expected action context");
    expect(result.statusCode).toBe(503);
    expect(result.actionData?.home).toEqual({ code, error });
    expect([...shortenedUrls]).toEqual(before);
  });

  it("serves home during an outage and returns 503 for unavailable resolution", async () => {
    state.mode = "outage";
    const home = await handler.query(new Request("http://localhost/"));
    if (home instanceof Response) throw new Error("Expected loader context");
    expect(home.statusCode).toBe(200);
    const redirect = await handler.query(new Request("http://localhost/s/aa"));
    if (redirect instanceof Response) throw new Error("Expected error context");
    expect(redirect.statusCode).toBe(503);
    expect(redirect.errors?.redirect).toMatchObject({
      status: 503,
      data: "Service temporarily unavailable. Please try again.",
    });
  });
});
