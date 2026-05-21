type LogFn = {
  (obj: object, msg?: string): void;
  (msg: string): void;
};

export interface Logger {
  info: LogFn;
  warn: LogFn;
  error: LogFn;
  debug: LogFn;
}

function wrap(level: "info" | "warn" | "error" | "debug"): LogFn {
  return ((objOrMsg: object | string, msg?: string) => {
    if (typeof objOrMsg === "string") {
      console[level](objOrMsg);
    } else {
      console[level](msg ?? "", objOrMsg);
    }
  }) as LogFn;
}

export const consoleLogger: Logger = {
  info: wrap("info"),
  warn: wrap("warn"),
  error: wrap("error"),
  debug: wrap("debug"),
};
