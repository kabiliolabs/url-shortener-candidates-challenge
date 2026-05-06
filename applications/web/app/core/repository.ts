export interface LinkRecord {
  id: string
  code: string
  originalUrl: string
  clickCount: number
  createdAt: Date
  lastClickAt: Date | null
}

export class RepositoryConflictError extends Error {
  readonly _tag = "RepositoryConflictError" as const
  constructor() {
    super("Unique constraint violation on code")
  }
}

export interface LinkRepository {
  findByCode(code: string): Promise<LinkRecord | null>
  findByUrl(url: string): Promise<LinkRecord | null>
  /** Throws RepositoryConflictError if code already exists */
  create(code: string, url: string): Promise<LinkRecord>
  /** Returns original URL after incrementing clicks, or null if not found */
  trackClick(code: string): Promise<string | null>
  listRecent(limit: number): Promise<LinkRecord[]>
  listAll(): Promise<LinkRecord[]>
}
