import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Err, Ok } from "../../../../shared/types/result";
import type { Result } from "../../../../shared/types/result";
import { ShortenedURL } from "../../domain/shortened-url";
import type {
  InsertShortenedURLError,
  ShortenerRepository,
  StorageUnavailable,
} from "../../application/ports/shortener-repository";
import * as schema from "./schema";

export class PostgresShortenerRepository implements ShortenerRepository {
  constructor(private readonly database: NodePgDatabase<typeof schema>) {}

  async insert(
    link: ShortenedURL,
  ): Promise<Result<void, InsertShortenedURLError>> {
    try {
      const inserted = await this.database
        .insert(schema.shortenedUrls)
        .values({ code: link.code, destination: link.destination.value })
        .onConflictDoNothing({ target: schema.shortenedUrls.code })
        .returning({ code: schema.shortenedUrls.code });
      return inserted.length === 1
        ? Ok(undefined)
        : Err({ code: "code_conflict" });
    } catch {
      return Err({ code: "storage_unavailable" });
    }
  }

  async findByCode(
    code: string,
  ): Promise<Result<ShortenedURL | null, StorageUnavailable>> {
    try {
      const [row] = await this.database
        .select()
        .from(schema.shortenedUrls)
        .where(eq(schema.shortenedUrls.code, code))
        .limit(1);
      if (!row) return Ok(null);
      const destination = ShortenedURL.parseDestination(row.destination);
      if (!destination.ok) return Err({ code: "storage_unavailable" });
      const link = ShortenedURL.create(row.code, destination.value);
      return link.ok ? link : Err({ code: "storage_unavailable" });
    } catch {
      return Err({ code: "storage_unavailable" });
    }
  }
}
