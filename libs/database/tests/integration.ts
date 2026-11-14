import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdtemp, readFile, readdir, writeFile } from "node:fs/promises";
import { createServer, type Socket } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { sql } from "drizzle-orm";
import {
  PostgresDatabase,
  type Database,
  type DatabaseConfig,
} from "@url-shortener/database";
import { pgTable, text } from "drizzle-orm/pg-core";
import { createRequire } from "node:module";

// Test schema only; the production package exports no application tables.
const schema = {
  fixtureRecords: pgTable("foundation_fixture_records", {
    id: text("id").primaryKey(),
    value: text("value").notNull(),
  }),
};

async function checkLifecycle(mode: string) {
  const config = JSON.parse(process.env.DATABASE_PROBE_CONFIG!);
  assert.throws(
    () => new PostgresDatabase({ ...config, port: 0 }, schema),
    /database configuration/i,
  );
  const database = new PostgresDatabase(config, schema);
  try {
    if (mode === "close") {
      await database.healthCheck();
      const row = await database.db.query.fixtureRecords.findFirst();
      assert.equal(row?.id, "persisted");
    }
  } finally {
    await database.close();
    await database.close();
  }
}

async function integration() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
  const scratch = await mkdtemp(join(tmpdir(), "database-foundation-"));
  const project = `database-test-${randomUUID().slice(0, 8)}`;
  const env = Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) => !/^(PG|POSTGRES_|DATABASE_|COMPOSE_)/.test(key),
    ),
  );
  Object.assign(env, {
    POSTGRES_HOST: "127.0.0.1",
    POSTGRES_PORT: "0",
    POSTGRES_DB: "foundation_test",
    POSTGRES_USER: "foundation_test",
    POSTGRES_PASSWORD: randomUUID(),
    DATABASE_MIGRATIONS_DIR: join(scratch, "migrations"),
  });
  const envFile = join(scratch, "compose.env");
  await writeFile(envFile, "");
  const composeArgs = [
    "compose",
    "--env-file",
    envFile,
    "-p",
    project,
    "-f",
    join(root, "docker-compose.yaml"),
  ];
  const children = new Set<number>();
  let interrupted = false;
  let cleaning = false;

  function terminate(pid: number) {
    try {
      process.kill(-pid, "SIGKILL");
    } catch {
      /* Already exited. */
    }
  }
  function run(
    command: string,
    args: string[],
    options: { failure?: boolean; timeout?: number; quiet?: boolean } = {},
  ) {
    if (interrupted && !cleaning) throw new Error("Integration interrupted");
    return new Promise<string>((resolveRun, reject) => {
      const child = spawn(command, args, {
        cwd: root,
        env: command === "docker" ? { ...env, POSTGRES_PORT: "0" } : env,
        detached: true,
        stdio: ["ignore", "pipe", "pipe"],
      });
      if (child.pid) children.add(child.pid);
      let output = "";
      let timedOut = false;
      const timer = setTimeout(() => {
        timedOut = true;
        if (child.pid) terminate(child.pid);
      }, options.timeout ?? 120_000);
      const collect = (chunk: Buffer) => {
        output += chunk.toString();
        if (output.length > 2_000_000 && child.pid) terminate(child.pid);
      };
      child.stdout.on("data", collect);
      child.stderr.on("data", collect);
      child.on("error", reject);
      child.on("close", (code) => {
        clearTimeout(timer);
        if (child.pid) children.delete(child.pid);
        if (
          timedOut ||
          code === null ||
          (options.failure ? code === 0 : code !== 0)
        ) {
          reject(
            new Error(
              `${command} ${args.join(" ")} failed (exit ${code}, timeout ${timedOut})\n${output}`,
            ),
          );
        } else {
          if (!options.quiet)
            console.log(
              `PASS: ${command} ${args.filter((arg) => !arg.startsWith(scratch)).join(" ")}${options.failure ? " (expected failure)" : ""}`,
            );
          resolveRun(output);
        }
      });
    });
  }
  const compose = (...args: string[]) =>
    run("docker", [...composeArgs, ...args]);
  function interrupt() {
    interrupted = true;
    for (const pid of children) terminate(pid);
  }
  process.once("SIGINT", interrupt);
  process.once("SIGTERM", interrupt);

  console.log(`Scratch directory: ${scratch}\nCompose project: ${project}`);

  let database: Database<typeof schema> | undefined;
  const sockets = new Set<Socket>();
  let connections = 0;
  const stalled = createServer((socket) => {
    connections++;
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
  });

  try {
    await run("docker", ["info"], { quiet: true, timeout: 15_000 });
    await compose("config", "--quiet");
    await compose("up", "-d", "--wait", "--wait-timeout", "90", "postgres");
    const mapping = await run(
      "docker",
      [...composeArgs, "port", "postgres", "5432"],
      { quiet: true },
    );
    const port = Number(mapping.trim().split(":").at(-1));
    assert.ok(Number.isInteger(port) && port > 0);
    env.POSTGRES_PORT = String(port);
    const config: DatabaseConfig = {
      host: "127.0.0.1",
      port,
      database: env.POSTGRES_DB!,
      user: env.POSTGRES_USER!,
      password: env.POSTGRES_PASSWORD!,
      connectionTimeoutMillis: 500,
    };
    database = new PostgresDatabase(config, schema);
    await database.healthCheck();
    const before = await database.db.execute(
      sql`select to_regclass('public.foundation_fixture_records') as fixture`,
    );
    assert.equal(
      before.rows[0].fixture,
      null,
      "constructor and health check must not migrate",
    );
    // Drizzle Kit receives only temporary test fixtures; no demo schema or SQL is shipped.
    const schemaPath = join(scratch, "schema.ts");
    const configPath = join(scratch, "drizzle.config.ts");
    const pgCore = createRequire(import.meta.url).resolve(
      "drizzle-orm/pg-core",
    );
    await writeFile(
      schemaPath,
      `import { pgTable, text } from ${JSON.stringify(pgCore)};
export const fixtureRecords = pgTable("foundation_fixture_records", {
  id: text("id").primaryKey(), value: text("value").notNull(),
});
`,
    );
    await writeFile(
      configPath,
      `export default ${JSON.stringify({
        dialect: "postgresql",
        schema: schemaPath,
        out: env.DATABASE_MIGRATIONS_DIR,
        dbCredentials: {
          host: config.host,
          port,
          database: config.database,
          user: config.user,
          password: config.password,
          ssl: false,
        },
      })};
`,
      { mode: 0o600 },
    );
    const migrate = (operation: string, failure = false) =>
      run(
        "pnpm",
        [
          "--filter",
          "@url-shortener/database",
          "exec",
          "drizzle-kit",
          operation,
          "--config",
          configPath,
        ],
        { failure },
      );
    await migrate("generate");
    const files = await readdir(env.DATABASE_MIGRATIONS_DIR!);
    const generated = files.find((name) => name.endsWith(".sql"));
    assert.ok(generated, "Kit must generate reviewable SQL");
    assert.match(
      await readFile(join(env.DATABASE_MIGRATIONS_DIR!, generated), "utf8"),
      /CREATE TABLE "foundation_fixture_records"/,
    );
    await migrate("migrate");
    await database.db
      .insert(schema.fixtureRecords)
      .values({ id: "persisted", value: "survives restart" });
    const snapshot = async () => ({
      rows: await database!.db.select().from(schema.fixtureRecords),
      columns: (
        await database!.db.execute(
          sql`select column_name, data_type, is_nullable from information_schema.columns where table_name = 'foundation_fixture_records' order by ordinal_position`,
        )
      ).rows,
      journal: (
        await database!.db.execute(
          sql`select * from drizzle.__drizzle_migrations order by id`,
        )
      ).rows,
    });
    const original = await snapshot();
    await migrate("migrate");
    assert.deepEqual(
      await snapshot(),
      original,
      "repeat application must preserve data, schema and journal",
    );
    // Build a deliberately broken pending fixture in scratch. Kit alone owns its application.
    const journalPath = join(
      env.DATABASE_MIGRATIONS_DIR!,
      "meta/_journal.json",
    );
    const journal = JSON.parse(await readFile(journalPath, "utf8"));
    const last = journal.entries.at(-1);
    journal.entries.push({
      idx: last.idx + 1,
      version: last.version,
      when: last.when + 1,
      tag: "9999_failure",
      breakpoints: true,
    });
    await writeFile(journalPath, JSON.stringify(journal));
    await writeFile(
      join(env.DATABASE_MIGRATIONS_DIR!, "9999_failure.sql"),
      "INSERT INTO foundation_fixture_records (id, value) VALUES ('must_rollback', 'rollback');\n--> statement-breakpoint\nSELECT * FROM deliberately_missing_foundation_table;\n",
    );
    await migrate("migrate", true);
    assert.deepEqual(
      await snapshot(),
      original,
      "failed migration must roll back data and journal",
    );

    await new Promise<void>((resolveListen) =>
      stalled.listen(0, "127.0.0.1", resolveListen),
    );
    const address = stalled.address();
    assert.ok(address && typeof address !== "string");
    const stalledConfig = {
      ...config,
      port: address.port,
      connectionTimeoutMillis: 150,
    };
    env.DATABASE_PROBE_CONFIG = JSON.stringify(stalledConfig);
    await run(
      "pnpm",
      [
        "--filter",
        "@url-shortener/database",
        "exec",
        "tsx",
        "tests/integration.ts",
        "lazy",
      ],
      { timeout: 10_000 },
    );
    assert.equal(connections, 0, "import and constructor must never connect");
    const unavailable = new PostgresDatabase(stalledConfig, schema);
    try {
      const start = Date.now();
      await assert.rejects(unavailable.healthCheck(), /timeout/i);
      assert.ok(
        Date.now() - start < 2000,
        "connection attempt must have a finite timeout",
      );
      assert.equal(connections, 1, "failed connection must not retry");
    } finally {
      await unavailable.close();
    }
    env.DATABASE_PROBE_CONFIG = JSON.stringify(config);
    await run(
      "pnpm",
      [
        "--filter",
        "@url-shortener/database",
        "exec",
        "tsx",
        "tests/integration.ts",
        "close",
      ],
      { timeout: 10_000 },
    );
    await database.close();
    database = undefined;
    await compose("restart", "postgres");
    await compose("up", "-d", "--wait", "--wait-timeout", "90", "postgres");
    const restartedMapping = await run(
      "docker",
      [...composeArgs, "port", "postgres", "5432"],
      { quiet: true },
    );
    config.port = Number(restartedMapping.trim().split(":").at(-1));
    database = new PostgresDatabase(config, schema);
    await database.healthCheck();
    assert.deepEqual(
      await snapshot(),
      original,
      "named volume must retain records after restart",
    );
    console.log(
      "PASS: public API, lazy import/constructor, finite timeout, cleanup, migrations and restart durability",
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    cleaning = true;
    try {
      await database?.close();
    } catch (error) {
      console.error("Database connection cleanup failed:", error);
      process.exitCode = 1;
    }
    for (const socket of sockets) socket.destroy();
    if (stalled.listening)
      await new Promise<void>((resolveClose) =>
        stalled.close(() => resolveClose()),
      );
    for (const pid of children) terminate(pid);
    try {
      await compose("down", "--volumes", "--remove-orphans", "--timeout", "10");
    } catch (error) {
      console.error("Test-owned Compose cleanup failed:", error);
      process.exitCode = 1;
    }
    console.log(`Scratch directory: ${scratch}\nCompose project: ${project}`);
    process.removeListener("SIGINT", interrupt);
    process.removeListener("SIGTERM", interrupt);
  }
}

if (["lazy", "close"].includes(process.argv[2])) {
  await checkLifecycle(process.argv[2]);
} else {
  await integration();
}
