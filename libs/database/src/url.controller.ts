import { generateShortCode } from "@url-shortener/engine";
import type { UrlDatabase } from "../generated/prisma/browser.js";
import { prisma } from "./prisma.js";

import { Prisma } from "../generated/prisma/client.js";
import { AppError } from "./errors.js";

export async function createUrl(fullUrl: string): Promise<UrlDatabase> {
  try {
    const existingUrl = await prisma.urlDatabase.findUnique({
      where: { url: fullUrl },
    });

    if (existingUrl) {
      return await prisma.urlDatabase.update({
        where: { id: existingUrl.id },
        data: { shortenCount: { increment: 1 } },
      });
    }

    const shortCode = generateShortCode();

    return await prisma.urlDatabase.create({
      data: { url: fullUrl, shortCode },
    });
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002" // Unique constraint violation
    ) {
      throw new AppError("This URL already exists", "URL_ALREADY_EXISTS");
    }

    throw new AppError("Failed to shorten URL", "DATABASE_ERROR");
  }
}

export async function getAllUrls(): Promise<UrlDatabase[]> {
    try {
        return await prisma.urlDatabase.findMany();
    } catch (error: unknown) {
        throw new AppError("Failed to get all URLs", "DATABASE_ERROR");
    }
}

export async function resolveShortCode(shortCode: string): Promise<string | null> {
    try {
        const record = await prisma.urlDatabase.findUnique({
          where: { shortCode },
        });
        if (!record) {
          return null;
        }
        await prisma.urlDatabase.update({
          where: { id: record.id },
          data: { clickCount: { increment: 1 } },
        });
        return record.url;
      } catch (error: unknown) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2025"
        ) {
          return null;
        }
        throw new AppError("Failed to resolve short code", "DATABASE_ERROR");
      }
  }