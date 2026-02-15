import { randomBytes } from "node:crypto";
import { db } from "../db.server.js";

export type ShortenedUrl = {
  id: string;
  code: string;
  url: string;
  createdAt: Date;
  clickCount: number;
};

export type UpdateShortenedUrlInput = { url?: string; code?: string };

const URL_MAX_LENGTH = 2048;
const MESSAGES = {
  URL_REQUIRED: "URL is required",
  URL_INVALID: "Invalid URL: must be http or https",
  URL_TOO_LONG: (max: number) => `URL must be at most ${max} characters`,
  CODE_GENERATION_FAILED: "Failed to generate unique short code",
};

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

const PRISMA_UNIQUE_VIOLATION = "P2002";
function isUniqueViolation(e: unknown): boolean {
  return !!(e && typeof e === "object" && "code" in e && (e as { code: string }).code === PRISMA_UNIQUE_VIOLATION);
}

const SHORT_CODE_ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const SHORT_CODE_LENGTH = 6;
const MAX_CREATE_ATTEMPTS = 10;
const UNBIASED_BYTE_MAX = 256 - (256 % SHORT_CODE_ALPHABET.length);

function isValidHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeStringInput(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isValidShortCodeFormat(code: string, alphabet: string, expectedLength: number): boolean {
  if (!code || code.length !== expectedLength) return false;
  const allowed = new Set(alphabet);
  return [...code].every((char) => allowed.has(char));
}

const SELECT_ALL = {
  id: true,
  code: true,
  url: true,
  createdAt: true,
  clickCount: true,
} as const;

async function repoCreate(data: { code: string; url: string }): Promise<ShortenedUrl> {
  const row = await db.shortenedUrl.create({
    data: { code: data.code, url: data.url },
    select: SELECT_ALL,
  });
  return row;
}

async function repoGetUrlAndIncrementClicks(code: string): Promise<string | null> {
  const row = await db.shortenedUrl.findUnique({ where: { code }, select: { url: true } });
  if (!row) return null;
  await db.shortenedUrl.update({ where: { code }, data: { clickCount: { increment: 1 } } });
  return row.url;
}

async function repoFindById(id: string): Promise<ShortenedUrl | null> {
  const row = await db.shortenedUrl.findUnique({ where: { id }, select: SELECT_ALL });
  return row;
}

async function repoFindByCode(code: string): Promise<ShortenedUrl | null> {
  const row = await db.shortenedUrl.findUnique({ where: { code }, select: SELECT_ALL });
  return row;
}

async function repoUpdateById(id: string, data: UpdateShortenedUrlInput): Promise<ShortenedUrl | null> {
  try {
    const payload: { url?: string; code?: string } = {};
    if (data.url !== undefined) payload.url = data.url;
    if (data.code !== undefined) payload.code = data.code;
    if (Object.keys(payload).length === 0) return repoFindById(id);
    const row = await db.shortenedUrl.update({ where: { id }, data: payload, select: SELECT_ALL });
    return row;
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && (e as { code: string }).code === "P2025") return null;
    throw e;
  }
}

async function repoUpdateByCode(code: string, data: UpdateShortenedUrlInput): Promise<ShortenedUrl | null> {
  try {
    const payload: { url?: string; code?: string } = {};
    if (data.url !== undefined) payload.url = data.url;
    if (data.code !== undefined) payload.code = data.code;
    if (Object.keys(payload).length === 0) return repoFindByCode(code);
    const row = await db.shortenedUrl.update({ where: { code }, data: payload, select: SELECT_ALL });
    return row;
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && (e as { code: string }).code === "P2025") return null;
    throw e;
  }
}

async function repoFindAll(): Promise<ShortenedUrl[]> {
  const rows = await db.shortenedUrl.findMany({
    orderBy: { createdAt: "desc" },
    select: SELECT_ALL,
  });
  return rows;
}

const BASE = SHORT_CODE_ALPHABET.length;

function generateCode(): string {
  const bytes = randomBytes(SHORT_CODE_LENGTH);
  let code = "";
  for (let i = 0; i < SHORT_CODE_LENGTH; i++) {
    let n = bytes[i]!;
    while (n >= UNBIASED_BYTE_MAX) {
      const [next] = randomBytes(1);
      n = next!;
    }
    code += SHORT_CODE_ALPHABET[n % BASE];
  }
  return code;
}

async function tryCreateWithUniqueCode(url: string): Promise<ShortenedUrl | null> {
  for (let attempt = 0; attempt < MAX_CREATE_ATTEMPTS; attempt++) {
    const code = generateCode();
    try {
      return await repoCreate({ code, url });
    } catch (e: unknown) {
      if (!isUniqueViolation(e)) throw e;
    }
  }
  return null;
}

function validateUrlInput(trimmed: string): void {
  if (!trimmed) throw new ValidationError(MESSAGES.URL_REQUIRED);
  if (trimmed.length > URL_MAX_LENGTH) throw new ValidationError(MESSAGES.URL_TOO_LONG(URL_MAX_LENGTH));
  if (!isValidHttpUrl(trimmed)) throw new ValidationError(MESSAGES.URL_INVALID);
}

function isCodeValidForLookup(code: string): boolean {
  return !!code && isValidShortCodeFormat(code, SHORT_CODE_ALPHABET, SHORT_CODE_LENGTH);
}

export async function shortenUrl(url: string): Promise<{ code: string; shortened: ShortenedUrl }> {
  const trimmed = normalizeStringInput(url);
  validateUrlInput(trimmed);

  const shortened = await tryCreateWithUniqueCode(trimmed);
  if (!shortened) throw new ConflictError(MESSAGES.CODE_GENERATION_FAILED);

  return { code: shortened.code, shortened };
}

export async function resolveAndTrackClick(code: string): Promise<string | null> {
  if (!isCodeValidForLookup(code)) return null;
  return repoGetUrlAndIncrementClicks(code);
}

export async function getById(id: string): Promise<ShortenedUrl | null> {
  return repoFindById(id);
}

export async function getByCode(code: string): Promise<ShortenedUrl | null> {
  if (!isCodeValidForLookup(code)) return null;
  return repoFindByCode(code);
}

export async function updateById(id: string, data: UpdateShortenedUrlInput): Promise<ShortenedUrl | null> {
  return repoUpdateById(id, data);
}

export async function updateByCode(code: string, data: UpdateShortenedUrlInput): Promise<ShortenedUrl | null> {
  if (!isCodeValidForLookup(code)) return null;
  return repoUpdateByCode(code, data);
}

export async function list(): Promise<ShortenedUrl[]> {
  return repoFindAll();
}
