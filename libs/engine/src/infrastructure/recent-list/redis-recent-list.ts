import type { Redis } from "ioredis";

import type { RecentList } from "../../domain/ports/recent-list";

export interface RedisRecentListOptions {
  client: Redis;
  key?: string;
  maxSize?: number;
}

const DEFAULT_KEY = "recent:urls";
const DEFAULT_MAX_SIZE = 100;

export class RedisRecentList implements RecentList {
  private readonly client: Redis;
  private readonly key: string;
  private readonly maxSize: number;

  constructor(opts: RedisRecentListOptions) {
    this.client = opts.client;
    this.key = opts.key ?? DEFAULT_KEY;
    this.maxSize = opts.maxSize ?? DEFAULT_MAX_SIZE;
  }

  async push(code: string): Promise<void> {
    const pipeline = this.client.multi();
    pipeline.lpush(this.key, code);
    pipeline.ltrim(this.key, 0, this.maxSize - 1);
    await pipeline.exec();
  }

  async range(limit: number): Promise<string[]> {
    if (limit <= 0) return [];
    return this.client.lrange(this.key, 0, limit - 1);
  }
}
