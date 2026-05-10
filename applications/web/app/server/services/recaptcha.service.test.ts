// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../lib/logger.server", () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

import { verifyRecaptcha } from "./recaptcha.service.server";

describe("recaptcha service", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("bypasses verification in test mode", async () => {
    process.env.NODE_ENV = "test";
    const result = await verifyRecaptcha("any-token");
    expect(result).toEqual({ success: true, score: 1.0 });
  });

  it("bypasses verification when RECAPTCHA_DISABLED is true", async () => {
    process.env.NODE_ENV = "production";
    process.env.RECAPTCHA_DISABLED = "true";
    const result = await verifyRecaptcha("any-token");
    expect(result).toEqual({ success: true, score: 1.0 });
  });

  it("returns failure when secret key is missing", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.RECAPTCHA_SECRET_KEY;
    delete process.env.RECAPTCHA_DISABLED;
    const result = await verifyRecaptcha("test-token");
    expect(result).toEqual({ success: false, score: 0 });
  });

  it("returns success for high score", async () => {
    process.env.NODE_ENV = "production";
    process.env.RECAPTCHA_SECRET_KEY = "test-secret";
    delete process.env.RECAPTCHA_DISABLED;

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.9, action: "shorten" }))
    );

    const result = await verifyRecaptcha("valid-token");
    expect(result).toEqual({ success: true, score: 0.9 });
  });

  it("returns failure for low score", async () => {
    process.env.NODE_ENV = "production";
    process.env.RECAPTCHA_SECRET_KEY = "test-secret";
    delete process.env.RECAPTCHA_DISABLED;

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.2, action: "shorten" }))
    );

    const result = await verifyRecaptcha("low-score-token");
    expect(result).toEqual({ success: false, score: 0.2 });
  });

  it("returns failure on action mismatch", async () => {
    process.env.NODE_ENV = "production";
    process.env.RECAPTCHA_SECRET_KEY = "test-secret";
    delete process.env.RECAPTCHA_DISABLED;

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.9, action: "login" }))
    );

    const result = await verifyRecaptcha("valid-token", "shorten");
    expect(result).toEqual({ success: false, score: 0.9 });
  });

  it("accepts custom expectedAction", async () => {
    process.env.NODE_ENV = "production";
    process.env.RECAPTCHA_SECRET_KEY = "test-secret";
    delete process.env.RECAPTCHA_DISABLED;

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.9, action: "login" }))
    );

    const result = await verifyRecaptcha("valid-token", "login");
    expect(result).toEqual({ success: true, score: 0.9 });
  });

  it("returns failure on fetch error", async () => {
    process.env.NODE_ENV = "production";
    process.env.RECAPTCHA_SECRET_KEY = "test-secret";
    delete process.env.RECAPTCHA_DISABLED;

    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));

    const result = await verifyRecaptcha("error-token");
    expect(result).toEqual({ success: false, score: 0 });
  });

  it("returns failure on timeout (AbortError)", async () => {
    process.env.NODE_ENV = "production";
    process.env.RECAPTCHA_SECRET_KEY = "test-secret";
    delete process.env.RECAPTCHA_DISABLED;

    const abortError = new DOMException("The operation was aborted", "AbortError");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(abortError);

    const result = await verifyRecaptcha("timeout-token");
    expect(result).toEqual({ success: false, score: 0 });
  });
});
