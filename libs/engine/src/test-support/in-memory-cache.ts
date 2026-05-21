import type { Cache } from "../domain/ports/cache";

export class InMemoryCache implements Cache {
  readonly entries = new Map<string, string>();
  setCalls: Array<{ key: string; value: string; ttlSeconds: number }> = [];
  delCalls: string[] = [];

  async get(key: string): Promise<string | null> {
    return this.entries.get(key) ?? null;
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    this.entries.set(key, value);
    this.setCalls.push({ key, value, ttlSeconds });
  }

  async del(key: string): Promise<void> {
    this.entries.delete(key);
    this.delCalls.push(key);
  }
}
