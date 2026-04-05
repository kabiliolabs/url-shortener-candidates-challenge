import { Prisma } from "../../generated/prisma/client.js";
import type { ShortenedUrlRepository } from "../application/repositories/shortened-url-repository";
import { DuplicateCodeError } from "../domain/errors/duplicate-code-error";
import type {
  CreateShortenedUrlInput,
  ShortenedUrl,
} from "../domain/models/shortened-url";
import { prisma } from "./db";

function isCodeUniqueConstraintError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  if (
    !(error instanceof Prisma.PrismaClientKnownRequestError) ||
    error.code !== "P2002"
  ) {
    return false;
  }

  const target = error.meta?.target;
  if (Array.isArray(target)) {
    return target.includes("code");
  }

  if (typeof target === "string") {
    return target.includes("code");
  }

  return false;
}

async function prismaCreateShortenedUrl(
  input: CreateShortenedUrlInput,
): Promise<ShortenedUrl> {
  try {
    const record = await prisma.shortenedUrl.create({
      data: {
        code: input.code,
        originalUrl: input.originalUrl,
      },
    });

    return toShortenedUrl(record);
  } catch (error) {
    if (isCodeUniqueConstraintError(error)) {
      throw new DuplicateCodeError(input.code);
    }
    throw error;
  }
}

async function prismaFindShortenedUrlByCode(
  code: string,
): Promise<ShortenedUrl | null> {
  const record = await prisma.shortenedUrl.findUnique({
    where: { code },
  });

  return record ? toShortenedUrl(record) : null;
}

async function prismaIncrementShortenedUrlClicks(code: string): Promise<void> {
  await prisma.shortenedUrl.update({
    where: { code },
    data: { clicks: { increment: 1 } },
  });
}

async function prismaListShortenedUrls(): Promise<ShortenedUrl[]> {
  const records = await prisma.shortenedUrl.findMany({
    orderBy: { createdAt: "desc" },
  });

  return records.map(toShortenedUrl);
}

export function createPrismaRepository(): ShortenedUrlRepository {
  return {
    create: prismaCreateShortenedUrl,
    findByCode: prismaFindShortenedUrlByCode,
    incrementClicks: prismaIncrementShortenedUrlClicks,
    list: prismaListShortenedUrls,
  };
}

type PrismaRecord = {
  id: string;
  code: string;
  originalUrl: string;
  clicks: number;
  createdAt: Date;
};

function toShortenedUrl(record: PrismaRecord): ShortenedUrl {
  return {
    id: record.id,
    code: record.code,
    originalUrl: record.originalUrl,
    clicks: record.clicks,
    createdAt: record.createdAt,
  };
}

export const shortenedUrlRepository = createPrismaRepository();
