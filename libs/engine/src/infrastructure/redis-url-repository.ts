import { createClient } from '@redis/client';
import { ShortenedUrl } from '../domain/entities/shortened-url';
import { ShortCode } from '../domain/value-objects/short-code';
import type { UrlRepositoryPort } from '../ports/url-repository-port';

export class RedisUrlRepository implements UrlRepositoryPort {
  private client: ReturnType<typeof createClient>;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });
  }

  private async ensureConnected(): Promise<void> {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  async save(shortUrl: ShortenedUrl): Promise<void> {
    await this.ensureConnected();
    const key = `shorturl:${shortUrl.code.toString()}`;
    await this.client.hSet(key, {
      targetUrl: shortUrl.targetUrl.toString(),
      createdAt: shortUrl.createdAt.toISOString(),
      clicks: shortUrl.clicks.toString(),
    });
    await this.client.sAdd('active-codes', shortUrl.code.toString());
    await this.client.expire(key, 365 * 24 * 60 * 60);
  }

  async findByCode(code: ShortCode): Promise<ShortenedUrl | null> {
    await this.ensureConnected();
    const key = `shorturl:${code.toString()}`;
    const data = await this.client.hGetAll(key);
    if (Object.keys(data).length === 0 || !data.targetUrl) {
      return null;
    }
    return ShortenedUrl.fromPrimitives({
      code: code.toString(),
      targetUrl: data.targetUrl,
      createdAt: data.createdAt!,
      clicks: parseInt(data.clicks || '0', 10),
    });
  }

  async incrementClicks(code: ShortCode): Promise<number> {
    await this.ensureConnected();
    const key = `shorturl:${code.toString()}`;
    const clicksStr = await this.client.hIncrBy(key, 'clicks', 1);
    return parseInt(String(clicksStr), 10);
  }

  async exists(code: string): Promise<boolean> {
    await this.ensureConnected();
    const member = await this.client.sIsMember('active-codes', code);
    return member === 1;
  }

  async listAll(): Promise<ShortenedUrl[]> {
    await this.ensureConnected();
    const codes: string[] = (await this.client.sMembers('active-codes')) as string[];
    const shortUrlsPromises = codes.map(async (codeStr) => {
      const shortUrl = await this.findByCode(new ShortCode(String(codeStr)));
      return shortUrl ?? null;
    });
    const shortUrls = await Promise.all(shortUrlsPromises);
    return shortUrls.filter((s): s is ShortenedUrl => s !== null);
  }
}