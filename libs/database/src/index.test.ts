import { afterEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { PostgresDatabase } from "./index";
import { pgTable, text } from "drizzle-orm/pg-core";

const mocks = vi.hoisted(() => ({
  constructor: vi.fn(),
  query: vi.fn(),
  end: vi.fn().mockResolvedValue(undefined),
  on: vi.fn(),
}));
vi.mock("pg", () => ({
  default: {
    Pool: class {
      constructor(config: unknown) {
        mocks.constructor(config);
      }
      query = mocks.query;
      end = mocks.end;
      on = mocks.on;
    },
  },
}));

const config = {
  host: "localhost",
  port: 5432,
  database: "fixture",
  user: "fixture",
  password: "secret",
};
afterEach(() => vi.clearAllMocks());

describe("database public lifecycle", () => {
  it("imports without constructing a pool", () => {
    expect(mocks.constructor).not.toHaveBeenCalled();
  });

  it.each([
    null,
    {},
    ...["host", "database", "user", "password"].flatMap((field) =>
      [undefined, "", " ", 42].map((value) => ({ ...config, [field]: value })),
    ),
    ...[undefined, 0, -1, 65536, 1.5, NaN, Infinity, "5432"].map((port) => ({
      ...config,
      port,
    })),
    ...[null, 0, -1, Infinity, NaN, 2147483648, "1000"].map(
      (connectionTimeoutMillis) => ({ ...config, connectionTimeoutMillis }),
    ),
  ])("rejects invalid configuration before creating a pool: %j", (invalid) => {
    expect(() => new PostgresDatabase(invalid as never, {})).toThrow(
      /database configuration/i,
    );
    expect(mocks.constructor).not.toHaveBeenCalled();
  });

  it("creates a lazy typed client with explicit configuration and a finite default timeout", async () => {
    const fixture = pgTable("fixture", { id: text("id").primaryKey() });
    const database = new PostgresDatabase(config, { fixture });
    type Row = Awaited<ReturnType<typeof database.db.query.fixture.findFirst>>;
    expectTypeOf<Row>().toEqualTypeOf<{ id: string } | undefined>();
    expect(database).toBeInstanceOf(PostgresDatabase);
    expect(database.db.execute).toBeTypeOf("function");
    expect(mocks.constructor).toHaveBeenCalledWith({
      ...config,
      connectionTimeoutMillis: 5000,
    });
    expect(mocks.query).not.toHaveBeenCalled();
    await database.close();
    await database.close();
    expect(mocks.end).toHaveBeenCalledTimes(1);
  });

  it("checks health explicitly and propagates a failure without retrying", async () => {
    const database = new PostgresDatabase(
      { ...config, connectionTimeoutMillis: 100 },
      {},
    );
    mocks.query.mockRejectedValueOnce(new Error("connection refused"));
    await expect(database.healthCheck()).rejects.toThrow("connection refused");
    expect(mocks.query).toHaveBeenCalledTimes(1);
    mocks.query.mockResolvedValueOnce({ rows: [{ value: 1 }] });
    await expect(database.healthCheck()).resolves.toBeUndefined();
    await database.close();
  });

  it("handles idle pool errors without an unhandled process error and exposes them at health check", async () => {
    const database = new PostgresDatabase(config, {});
    const handler = mocks.on.mock.calls[0][1];
    handler(new Error("idle connection lost"));
    await expect(database.healthCheck()).rejects.toThrow(
      "idle connection lost",
    );
    await database.close();
  });
});
