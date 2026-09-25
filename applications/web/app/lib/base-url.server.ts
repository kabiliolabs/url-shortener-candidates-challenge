/** Runtime config lives at the web layer; domain/application code never reads process.env. */
export function getBaseUrl(): string {
  return process.env.PUBLIC_URL || "http://localhost:5173";
}
