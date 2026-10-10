import { DestinationUrl, ShortCode, ShortCodeAlreadyExistsError, ShortLink } from "../../../domain";
import type { ShortLinkRepository } from "../../../domain";
import { Prisma } from "./generated/client";
import type { PrismaClient } from "./generated/client";

const UNIQUE_CONSTRAINT_VIOLATION = "P2002";

export class PrismaShortLinkRepository implements ShortLinkRepository {
  constructor(private readonly prismaClient: PrismaClient) {}

  async save(link: ShortLink): Promise<void> {
    try {
      await this.prismaClient.shortLink.create({ data: link.toPrimitives() });
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        throw new ShortCodeAlreadyExistsError(link.code);
      }
      throw error;
    }
  }

  async findByCode(code: ShortCode): Promise<ShortLink | null> {
    const row = await this.prismaClient.shortLink.findUnique({ where: { code: code.value } });
    if (!row) return null;
    return new ShortLink(new ShortCode(row.code), new DestinationUrl(row.destination), row.createdAt);
  }
}

function isUniqueConstraintViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === UNIQUE_CONSTRAINT_VIOLATION;
}
