import { prisma } from "./db";

function generateShortCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const length = 6;
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function getShortenedUrl(shortCode: string) {
  return await prisma.shortenedUrl.findUnique({
    where: {
      shortCode,
    },
  });
}

export async function incrementClicks(shortCode: string): Promise<void> {
  try {
    await prisma.shortenedUrl.update({
      where: { shortCode },
      data: { clicks: { increment: 1 } },
    });
  } catch (error) {
    console.error(`Failed to increment clicks for ${shortCode}:`, error);
  }
}

export async function getOrCreateShortenedUrl(originalUrl: string): Promise<string> {
  // Check if a short code already exists for this URL
  const existing = await prisma.shortenedUrl.findFirst({
    where: {
      originalUrl,
    },
  });

  if (existing) {
    return existing.shortCode;
  }

  // Generate a new short code and ensure it's unique
  let shortCode = generateShortCode();
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const exists = await getShortenedUrl(shortCode);
    if (!exists) {
      break;
    }
    shortCode = generateShortCode();
    attempts++;
  }

  if (attempts >= maxAttempts) {
    throw new Error("Failed to generate unique short code");
  }

  await prisma.shortenedUrl.create({
    data: {
      shortCode,
      originalUrl,
    },
  });
  return shortCode;
}
