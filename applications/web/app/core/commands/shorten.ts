import { Effect } from "effect"
import type { LinkRepository, LinkRecord } from "../repository.js"
import { RepositoryConflictError } from "../repository.js"
import { InvalidUrlError, CodeCollisionError, RateLimitError } from "../errors.js"
import { generateCode, MAX_ATTEMPTS } from "../short-code.js"

export interface ShortenResult {
  link: LinkRecord
  /** false = URL was already in the database, no new record created */
  isNew: boolean
}

// --- URL validation --------------------------------------------------------

function parseUrl(raw: string): Effect.Effect<string, InvalidUrlError> {
  const trimmed = raw.trim()
  if (!trimmed) return Effect.fail(new InvalidUrlError({ reason: "empty" }))
  if (trimmed.length > 2048) return Effect.fail(new InvalidUrlError({ reason: "too_long" }))
  try {
    const { protocol } = new URL(trimmed)
    if (protocol !== "http:" && protocol !== "https:") {
      return Effect.fail(new InvalidUrlError({ reason: "format" }))
    }
    return Effect.succeed(trimmed)
  } catch {
    return Effect.fail(new InvalidUrlError({ reason: "format" }))
  }
}

// --- Rate limiting (in-memory, per client key) ----------------------------

const RATE_LIMIT = 10
const RATE_WINDOW_MS = 60_000
const buckets = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(key: string): Effect.Effect<void, RateLimitError> {
  const now = Date.now()
  const slot = buckets.get(key)
  if (!slot || now > slot.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return Effect.void
  }
  if (slot.count >= RATE_LIMIT) return Effect.fail(new RateLimitError())
  slot.count++
  return Effect.void
}

// --- Code creation with retry on collision ---------------------------------

function tryCreate(
  repo: LinkRepository,
  url: string,
  attemptsLeft: number,
): Effect.Effect<LinkRecord, CodeCollisionError> {
  if (attemptsLeft <= 0) return Effect.fail(new CodeCollisionError())
  const code = generateCode()
  return Effect.tryPromise({
    try: () => repo.create(code, url),
    catch: (e) =>
      e instanceof RepositoryConflictError ? e : new CodeCollisionError(),
  }).pipe(
    Effect.catchIf(
      (e): e is RepositoryConflictError => e instanceof RepositoryConflictError,
      () => tryCreate(repo, url, attemptsLeft - 1),
    ),
  )
}

// --- Public command factory ------------------------------------------------

export function makeShortenCommand(repo: LinkRepository) {
  return (
    rawUrl: string,
    clientKey: string,
  ): Effect.Effect<ShortenResult, InvalidUrlError | CodeCollisionError | RateLimitError> =>
    Effect.gen(function* () {
      yield* checkRateLimit(clientKey)
      const url = yield* parseUrl(rawUrl)

      const existing = yield* Effect.tryPromise({
        try: () => repo.findByUrl(url),
        catch: () => new CodeCollisionError(),
      })
      if (existing) return { link: existing, isNew: false }

      const link = yield* tryCreate(repo, url, MAX_ATTEMPTS)
      return { link, isNew: true }
    })
}
