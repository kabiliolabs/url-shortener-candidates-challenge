import pg from "pg";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  connectionTimeoutMillis?: number;
}

export interface Database<TSchema extends Record<string, unknown>> {
  db: NodePgDatabase<TSchema>;
  healthCheck(): Promise<void>;
  close(): Promise<void>;
}

export class PostgresDatabase<TSchema extends Record<string, unknown>>
  implements Database<TSchema>
{
  readonly db: NodePgDatabase<TSchema>;
  private readonly pool: pg.Pool;
  private idleError: Error | undefined;
  private closing: Promise<void> | undefined;

  constructor(config: DatabaseConfig, schema: TSchema) {
    if (!config || typeof config !== "object") {
      throw new Error(
        "Invalid database configuration: expected connection settings",
      );
    }
    for (const key of ["host", "database", "user", "password"] as const) {
      if (typeof config[key] !== "string" || !config[key].trim()) {
        throw new Error(
          `Invalid database configuration: ${key} must be a nonempty string`,
        );
      }
    }
    if (
      !Number.isInteger(config.port) ||
      config.port < 1 ||
      config.port > 65535
    ) {
      throw new Error(
        "Invalid database configuration: port must be an integer from 1 to 65535",
      );
    }
    const connectionTimeoutMillis =
      config.connectionTimeoutMillis === undefined
        ? 5000
        : config.connectionTimeoutMillis;
    if (
      !Number.isFinite(connectionTimeoutMillis) ||
      connectionTimeoutMillis < 1 ||
      connectionTimeoutMillis > 2147483647
    ) {
      throw new Error(
        "Invalid database configuration: connectionTimeoutMillis must be between 1 and 2147483647",
      );
    }
    this.pool = new pg.Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      connectionTimeoutMillis,
    });
    this.pool.on("error", (error: Error) => {
      this.idleError = error;
    });
    this.db = drizzle({ client: this.pool, schema });
  }

  async healthCheck(): Promise<void> {
    if (this.idleError) {
      const error = this.idleError;
      this.idleError = undefined;
      throw error;
    }
    await this.pool.query("SELECT 1");
  }

  close(): Promise<void> {
    this.closing ??= this.pool.end();
    return this.closing;
  }
}
