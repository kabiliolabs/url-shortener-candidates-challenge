import type { IUrlRepository } from '../domain/repositories/IUrlRepository';
import { Url } from '../domain/entities/Url';
import { OriginalUrl } from '../domain/value-objects/OriginalUrl';
import { ShortCode } from '../domain/value-objects/ShortCode';
import { db } from './db';

export class PrismaUrlRepository implements IUrlRepository {
  async save(url: Url): Promise<void> {
    await db.url.create({
      data: {
        id: url.id,
        originalUrl: url.originalUrl.getValue,
        shortCode: url.shortCode.getValue,
        clicks: url.clicks,
        createdAt: url.createdAt
      }
    })
  }

  async findByCode(code: string): Promise<Url | null> {
    const data = await db.url.findUnique({
      where: { shortCode: code }
    })

    if (!data) return null

    return Url.create({
      id: data.id,
      originalUrl: OriginalUrl.create(data.originalUrl),
      shortCode: ShortCode.create(data.shortCode),
      clicks: data.clicks,
      createdAt: data.createdAt
    })
  }

  async incrementClicks(code: string): Promise<void> {
    await db.url.update({
      where: { shortCode: code },
      data: { clicks: { increment: 1 } }
    })
  }

  async findRecent(offset: number, limit: number) {
    const [urls, total] = await db.$transaction([
      db.url.findMany({
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.url.count()
    ])

    return {
      data: urls.map((data: any) =>
        Url.create({
          id: data.id,
          originalUrl: OriginalUrl.create(data.originalUrl),
          shortCode: ShortCode.create(data.shortCode),
          clicks: data.clicks,
          createdAt: data.createdAt
        })
      ),
      total
    }
  }
}
