import { describe, expect, it } from "vitest";
import type { Clock } from "../../application";
import { JsonConsoleLogger } from "./json-console.logger";

const fixedNow = new Date("2026-01-02T03:04:05.000Z");
const clock: Clock = { now: () => fixedNow };

function createLogger(loggerClock: Clock = clock) {
  const lines: string[] = [];
  const logger = new JsonConsoleLogger(loggerClock, (line) => lines.push(line));
  return { logger, lines };
}

function expectSingleParsableLine(lines: string[]) {
  expect(lines).toHaveLength(1);
  expect(lines[0]).not.toMatch(/[\r\n]/);
  return JSON.parse(lines[0]!);
}

describe("JsonConsoleLogger", () => {
  it("includes the level, message and ISO timestamp", () => {
    const { logger, lines } = createLogger();

    logger.error("boom");

    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0]!)).toEqual({
      level: "error",
      message: "boom",
      timestamp: "2026-01-02T03:04:05.000Z",
    });
  });

  it("keeps a value containing newlines on a single line that parses back intact", () => {
    const { logger, lines } = createLogger();
    const hostile = 'abc\n{"level":"info","message":"forged"}\r\n';

    logger.error("lookup failed", { shortCode: hostile });

    expect(lines).toHaveLength(1);
    expect(lines[0]).not.toMatch(/[\r\n]/);
    expect(JSON.parse(lines[0]!).context.shortCode).toBe(hostile);
  });

  it("keeps the name, message and stack of an Error in the context", () => {
    const { logger, lines } = createLogger();
    const error = new TypeError("bad input");

    logger.error("failed", { error });

    const parsed = JSON.parse(lines[0]!).context.error;
    expect(parsed.name).toBe("TypeError");
    expect(parsed.message).toBe("bad input");
    expect(parsed.stack).toContain("bad input");
  });

  it("serializes the cause of an Error", () => {
    const { logger, lines } = createLogger();
    const error = new Error("outer", { cause: new RangeError("inner") });

    logger.error("failed", { error });

    const parsed = JSON.parse(lines[0]!).context.error;
    expect(parsed.cause.name).toBe("RangeError");
    expect(parsed.cause.message).toBe("inner");
  });

  it("does not overflow on circular causes", () => {
    const { logger, lines } = createLogger();
    const error = new Error("loop");
    error.cause = error;

    logger.error("failed", { error });

    expect(JSON.parse(lines[0]!).context.error.message).toBe("loop");
  });

  it("does not let context keys override the reserved fields", () => {
    const { logger, lines } = createLogger();

    logger.error("real", { level: "info", message: "fake", timestamp: "x" });

    const parsed = JSON.parse(lines[0]!);
    expect(parsed.level).toBe("error");
    expect(parsed.message).toBe("real");
    expect(parsed.context.message).toBe("fake");
  });

  it("keeps own enumerable properties of an Error such as code", () => {
    const { logger, lines } = createLogger();
    const error = Object.assign(new Error("x"), { code: "E1" });

    logger.error("failed", { error });

    const parsed = expectSingleParsableLine(lines).context.error;
    expect(parsed.code).toBe("E1");
    expect(parsed.message).toBe("x");
  });

  it("serializes a BigInt in the context without throwing", () => {
    const { logger, lines } = createLogger();

    expect(() => logger.error("failed", { count: 10n })).not.toThrow();

    expect(expectSingleParsableLine(lines).context.count).toBe("10");
  });

  it("marks a circular context object without throwing", () => {
    const { logger, lines } = createLogger();
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    expect(() => logger.error("failed", circular)).not.toThrow();

    expect(expectSingleParsableLine(lines).context.self).toBe("[Circular]");
  });

  it("handles a circular non-Error cause without throwing", () => {
    const { logger, lines } = createLogger();
    const cause: Record<string, unknown> = {};
    cause.self = cause;
    const error = new Error("outer", { cause });

    expect(() => logger.error("failed", { error })).not.toThrow();

    expect(expectSingleParsableLine(lines).message).toBe("failed");
  });

  it("falls back to a safe line when a getter throws", () => {
    const { logger, lines } = createLogger();
    const context = {
      get boom(): string {
        throw new Error("getter");
      },
    };

    expect(() => logger.error("failed", context)).not.toThrow();

    const parsed = expectSingleParsableLine(lines);
    expect(parsed.logSerializationFailed).toBe(true);
    expect(parsed.level).toBe("error");
    expect(parsed.message).toBe("failed");
  });

  it("falls back to a safe line when an Error stack getter throws", () => {
    const { logger, lines } = createLogger();
    const error = new Error("x");
    Object.defineProperty(error, "stack", {
      get() {
        throw new Error("stack");
      },
    });

    expect(() => logger.error("failed", { error })).not.toThrow();

    expect(expectSingleParsableLine(lines).logSerializationFailed).toBe(true);
  });

  it("uses a safe timestamp when the clock throws", () => {
    const { logger, lines } = createLogger({
      now: () => {
        throw new Error("clock");
      },
    });

    expect(() => logger.error("failed")).not.toThrow();

    const parsed = expectSingleParsableLine(lines);
    expect(Number.isNaN(new Date(parsed.timestamp).getTime())).toBe(false);
  });

  it("uses a safe timestamp when the clock returns an invalid date", () => {
    const { logger, lines } = createLogger({ now: () => new Date(Number.NaN) });

    expect(() => logger.error("failed")).not.toThrow();

    const parsed = expectSingleParsableLine(lines);
    expect(Number.isNaN(new Date(parsed.timestamp).getTime())).toBe(false);
  });

  it("swallows a throwing sink", () => {
    const logger = new JsonConsoleLogger(clock, () => {
      throw new Error("sink");
    });

    expect(() => logger.error("failed", { a: 1 })).not.toThrow();
  });
});
