import { DestinationUrl } from "../domain/destination-url";
import { ShortCodeCollisionError, ShortCodeExhaustionError } from "../domain/errors";
import type { RandomIntSource } from "../domain/short-code";
import { ShortenedUrl } from "../domain/shortened-url";
import type { ShortenedUrlRepository } from "../domain/shortened-url-repository";

const MAX_ATTEMPTS = 5;

/**
 * Use case: shorten a URL.
 *
 * Collision strategy: generate, try to insert, and let the database's unique
 * index be the arbiter. On conflict we retry with a fresh code. This is race-free,
 * unlike "check if it exists, then write", and it is why two different URLs can
 * never end up sharing a code or overwriting each other (the original bug).
 *
 * It is also idempotent: shortening the same destination twice returns the same
 * short link instead of filling the database with duplicates.
 */
export class ShortenUrl {
  constructor(
    private readonly repository: ShortenedUrlRepository,
    private readonly randomInt?: RandomIntSource,
  ) {}

  async execute(rawUrl: unknown): Promise<ShortenedUrl> {
    const destination = DestinationUrl.parse(rawUrl);

    const existing = await this.repository.findByDestination(destination);
    if (existing) return existing;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const candidate = ShortenedUrl.create(destination, this.randomInt);
      try {
        await this.repository.save(candidate);
        return candidate;
      } catch (error) {
        if (error instanceof ShortCodeCollisionError && attempt < MAX_ATTEMPTS) continue;
        if (error instanceof ShortCodeCollisionError) break;
        throw error;
      }
    }

    throw new ShortCodeExhaustionError(
      "Could not generate a unique short code. Please try again.",
    );
  }
}
