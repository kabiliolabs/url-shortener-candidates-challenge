/**
 * Public API for shortened URLs. Orchestrates repository and domain utils.
 * No direct DB access. Backend-only.
 */
import type {
  ShortenedUrlEntity,
  ShortenUrlResult,
  UpdateShortenedUrlInput,
} from "../types.js";
import { ConflictError } from "../errors.js";
import { SERVER_MESSAGES } from "../constants.js";
import * as repo from "../repository/shortened-url.repository.js";
import { normalizeStringInput, validateUrlInput } from "../utils/url-validation.server.js";
import {
  generateShortCode,
  isCodeValidForLookup,
  MAX_CREATE_ATTEMPTS,
} from "../utils/short-code.server.js";
import { isUniqueViolation } from "../utils/prisma-error.server.js";

async function tryCreateWithUniqueCode(url: string): Promise<ShortenedUrlEntity | null> {
  for (let attempt = 0; attempt < MAX_CREATE_ATTEMPTS; attempt++) {
    const code = generateShortCode();
    try {
      return await repo.create({ code, url });
    } catch (e: unknown) {
      if (!isUniqueViolation(e)) throw e;
    }
  }
  return null;
}

export async function shortenUrl(url: string): Promise<ShortenUrlResult> {
  const trimmed = normalizeStringInput(url);
  validateUrlInput(trimmed);

  const existing = await repo.findFirstByUrl(trimmed);
  if (existing) return { code: existing.code, shortened: existing };

  const shortened = await tryCreateWithUniqueCode(trimmed);
  if (!shortened) {
    throw new ConflictError(SERVER_MESSAGES.SHORT_CODE_COLLISION);
  }

  return { code: shortened.code, shortened };
}

export async function resolveAndTrackClick(code: string): Promise<string | null> {
  if (!isCodeValidForLookup(code)) return null;
  return repo.getUrlAndIncrementClicks(code);
}

export async function getById(id: string): Promise<ShortenedUrlEntity | null> {
  return repo.findById(id);
}

export async function getByCode(code: string): Promise<ShortenedUrlEntity | null> {
  if (!isCodeValidForLookup(code)) return null;
  return repo.findByCode(code);
}

export async function updateById(
  id: string,
  data: UpdateShortenedUrlInput
): Promise<ShortenedUrlEntity | null> {
  return repo.updateById(id, data);
}

export async function updateByCode(
  code: string,
  data: UpdateShortenedUrlInput
): Promise<ShortenedUrlEntity | null> {
  if (!isCodeValidForLookup(code)) return null;
  return repo.updateByCode(code, data);
}

export async function list(): Promise<ShortenedUrlEntity[]> {
  return repo.findAll();
}
