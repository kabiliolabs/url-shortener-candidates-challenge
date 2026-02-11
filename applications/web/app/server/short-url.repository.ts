import { prisma } from "~/lib/prisma.server";

export async function listShortUrls(limit = 200) {
  return prisma.shortUrl.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      code: true,
      originalUrl: true,
      clicks: true,
      createdAt: true,
    },
  });
}

export async function createShortUrl(originalUrl: string) {
  return prisma.shortUrl.create({
    data: { originalUrl },
    select: { id: true },
  });
}

export async function setShortCode(id: number, code: string) {
  return prisma.shortUrl.update({
    where: { id },
    data: { code },
  });
}

export async function deleteShortUrl(id: number) {
  try {
    await prisma.shortUrl.delete({ where: { id } });
    return { ok: true as const };
  } catch (e: any) {
    if (e?.code === "P2025") {
      return { ok: false as const, reason: "NOT_FOUND" as const };
    }
    return { ok: false as const, reason: "UNKNOWN" as const };
  }
}

export async function findByCode(code: string) {
  return prisma.shortUrl.findUnique({
    where: { code },
    select: {
      id: true,
      originalUrl: true,
    },
  });
}

export async function incrementClicks(id: number) {
  return prisma.shortUrl.update({
    where: { id },
    data: { clicks: { increment: 1 } },
  });
}
