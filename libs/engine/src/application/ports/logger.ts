/** Port: minimal logging, so use cases can report failures without knowing the sink. */
export interface Logger {
  error(message: string, context?: Record<string, unknown>): void;
}
