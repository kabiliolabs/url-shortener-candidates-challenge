/**
 * Maintains a bounded, newest-first list of short codes for the home page.
 *
 * Backed by Redis in production so the index route never touches the
 * partitioned `shortened_url` table for steady-state traffic. The list is
 * trimmed to `maxSize` on every push.
 */
export interface RecentList {
  push(code: string): Promise<void>;
  range(limit: number): Promise<string[]>;
}
