import type { Click, ClickRepository } from "../../../domain";
import type { PrismaClient } from "./generated/client";

export class PrismaClickRepository implements ClickRepository {
  constructor(private readonly prismaClient: PrismaClient) {}

  async record(click: Click): Promise<void> {
    await this.prismaClient.click.create({ data: click.toPrimitives() });
  }
}
