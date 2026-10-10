import type { Clock, Logger } from "../../application";

type Sink = (line: string) => void;

const MAX_CAUSE_DEPTH = 5;

const writeToStderr: Sink = (line) => {
  process.stderr.write(`${line}\n`);
};

function serializeError(error: Error, depth: number): Record<string, unknown> {
  const serialized: Record<string, unknown> = {
    ...error,
    name: error.name,
    message: error.message,
    stack: error.stack,
  };
  if (error.cause !== undefined && depth < MAX_CAUSE_DEPTH) {
    serialized.cause =
      error.cause instanceof Error ? serializeError(error.cause, depth + 1) : error.cause;
  }
  return serialized;
}

function createReplacer(): (key: string, value: unknown) => unknown {
  const seen = new WeakSet<object>();
  return (_key, value) => {
    if (typeof value === "bigint") return value.toString();
    if (typeof value !== "object" || value === null) return value;
    if (seen.has(value)) return "[Circular]";
    seen.add(value);
    return value instanceof Error ? serializeError(value, 0) : value;
  };
}

export class JsonConsoleLogger implements Logger {
  constructor(
    private readonly clock: Clock,
    private readonly sink: Sink = writeToStderr,
  ) {}

  error(message: string, context?: Record<string, unknown>): void {
    try {
      const timestamp = this.timestamp();
      let line: string;
      try {
        line = JSON.stringify(
          { level: "error", message, timestamp, ...(context && { context }) },
          createReplacer(),
        );
      } catch {
        line = JSON.stringify({
          level: "error",
          message: String(message),
          timestamp,
          logSerializationFailed: true,
        });
      }
      this.sink(line);
    } catch {
      return;
    }
  }

  private timestamp(): string {
    try {
      return this.clock.now().toISOString();
    } catch {
      return new Date(Date.now()).toISOString();
    }
  }
}
