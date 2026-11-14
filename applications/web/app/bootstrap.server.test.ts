// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  readConfig: vi.fn(),
  createDatabase: vi.fn(),
  returning: vi.fn(),
  limit: vi.fn(),
  close: vi.fn(),
}));
vi.mock("../database/config", () => ({
  readDatabaseConfig: state.readConfig,
}));
vi.mock("@url-shortener/database", () => ({
  PostgresDatabase: state.createDatabase,
}));

beforeEach(() => {
  vi.resetModules();
  vi.resetAllMocks();
  state.close.mockResolvedValue(undefined);
  state.readConfig.mockReturnValue({ host: "test" });
  state.returning.mockResolvedValue([{ code: "inserted" }]);
  state.limit.mockResolvedValue([
    { code: "legacy", destination: "https://example.com/path" },
  ]);
  state.createDatabase.mockImplementation(function () {
    return {
      close: state.close,
      db: {
        insert: () => ({
          values: () => ({
            onConflictDoNothing: () => ({ returning: state.returning }),
          }),
        }),
        select: () => ({
          from: () => ({ where: () => ({ limit: state.limit }) }),
        }),
      },
    };
  });
});

const unavailable = {
  ok: false,
  error: {
    code: "storage_unavailable",
    message: "Service temporarily unavailable. Please try again.",
  },
};

describe("application bootstrap", () => {
  it("defers configuration until validated operations and safely handles configuration failure", async () => {
    state.readConfig.mockImplementation(() => {
      throw new Error("private configuration detail");
    });
    const { shortenURL, resolveShortenedURL } =
      await import("./bootstrap.server");
    expect(state.readConfig).not.toHaveBeenCalled();
    expect(await shortenURL.execute("")).toEqual({
      ok: false,
      error: { code: "required", message: "URL is required" },
    });
    expect(await resolveShortenedURL.execute(" ")).toEqual({
      ok: false,
      error: { code: "invalid_code", message: "Invalid short code" },
    });
    expect(state.readConfig).not.toHaveBeenCalled();
    expect(await shortenURL.execute("https://example.com")).toEqual(
      unavailable,
    );
    expect(await resolveShortenedURL.execute("legacy")).toEqual(unavailable);
    expect(state.readConfig).toHaveBeenCalledTimes(2);
    expect(state.createDatabase).not.toHaveBeenCalled();
  });

  it("initializes once and shares the direct database client across both use cases", async () => {
    const { shortenURL, resolveShortenedURL } =
      await import("./bootstrap.server");
    expect(state.createDatabase).not.toHaveBeenCalled();
    expect((await shortenURL.execute("https://example.com")).ok).toBe(true);
    expect((await shortenURL.execute("https://example.com")).ok).toBe(true);
    expect(await resolveShortenedURL.execute("legacy")).toEqual({
      ok: true,
      value: "https://example.com/path",
    });
    expect(state.readConfig).toHaveBeenCalledOnce();
    expect(state.createDatabase).toHaveBeenCalledOnce();
    expect(state.returning).toHaveBeenCalledTimes(2);
    expect(state.limit).toHaveBeenCalledOnce();
  });

  it("returns safe construction failures and retries initialization on a later request", async () => {
    state.createDatabase.mockImplementationOnce(function () {
      throw new Error("private pool configuration");
    });
    const { shortenURL, resolveShortenedURL } =
      await import("./bootstrap.server");
    expect(await shortenURL.execute("https://example.com")).toEqual(
      unavailable,
    );
    expect(state.returning).not.toHaveBeenCalled();
    expect(await resolveShortenedURL.execute("legacy")).toEqual({
      ok: true,
      value: "https://example.com/path",
    });
    expect(state.readConfig).toHaveBeenCalledTimes(2);
    expect(state.createDatabase).toHaveBeenCalledTimes(2);
    expect(state.limit).toHaveBeenCalledOnce();
  });
  it("keeps database instances scoped to each application bootstrap", async () => {
    const { bootstrapApplication } = await import("./bootstrap.server");
    const first = bootstrapApplication();
    const second = bootstrapApplication();
    expect(state.createDatabase).not.toHaveBeenCalled();
    expect((await first.shortenURL.execute("https://first.example")).ok).toBe(
      true,
    );
    expect((await first.resolveShortenedURL.execute("legacy")).ok).toBe(true);
    expect(state.createDatabase).toHaveBeenCalledOnce();
    expect((await second.shortenURL.execute("https://second.example")).ok).toBe(
      true,
    );
    expect(state.createDatabase).toHaveBeenCalledTimes(2);
    await first.close();
    await second.close();
    expect(state.close).toHaveBeenCalledTimes(2);
  });

  it("does not initialize the database when closing an unused application", async () => {
    const { close } = await import("./bootstrap.server");
    await close();
    expect(state.readConfig).not.toHaveBeenCalled();
    expect(state.createDatabase).not.toHaveBeenCalled();
    expect(state.close).not.toHaveBeenCalled();
  });

  it("exposes cleanup that waits for the initialized database to close", async () => {
    const { bootstrapApplication } = await import("./bootstrap.server");
    const application = bootstrapApplication();
    expect(
      (await application.shortenURL.execute("https://example.com")).ok,
    ).toBe(true);
    let finishClose!: () => void;
    state.close.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        finishClose = resolve;
      }),
    );
    let closed = false;
    const closing = application.close().then(() => {
      closed = true;
    });
    await Promise.resolve();
    expect(state.close).toHaveBeenCalledOnce();
    expect(closed).toBe(false);
    finishClose();
    await closing;
    expect(closed).toBe(true);
    expect(state.createDatabase).toHaveBeenCalledOnce();
  });
});
