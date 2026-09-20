import { Router, type Router as RouterType } from "express";
import { Prisma } from "@prisma/client";
import { db } from "../db.js";
import { createCode } from "../utils/createCode.js";
import { validateUrl } from "../utils/validateUrl.js";

export const shortLinkRouter: RouterType = Router();

shortLinkRouter.post("/shorten", async (request, response) => {
  const { url } = request.body as { url?: unknown };
  const validation = validateUrl(url);

  if (!validation.valid) {
    response.status(400).json({
      error: validation.message,
      code: validation.code,
      field: validation.field,
    });
    return;
  }

  try {
    let record;
    for (;;) {
      try {
        record = await db.shortLink.create({
          data: { code: createCode(), originalUrl: validation.url.toString() },
        });
        break;
      } catch (error) {
        if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
          throw error;
        }
      }
    }
    response.status(201).json({ shortUrl: `${request.protocol}://${request.get("host")}/${record.code}` });
      
} catch (error) {
    console.error("Failed to shorten URL", error);
    response.status(500).json({ error: "Failed to shorten URL" });
  }
});

shortLinkRouter.get("/:code", async (request, response) => {
  try {
    const link = await db.shortLink.findUnique({ where: { code: request.params.code } });

    if (!link) {
      response.status(404).json({ error: "Short link not found" });
      return;
    }

    await db.shortLink.update({
      where: { id: link.id },
      data: { clicks: { increment: 1 } },
    });

    response.redirect(link.originalUrl);
  } catch (error) {
    console.error("Failed to resolve short link", error);
    response.status(500).json({ error: "Failed to resolve short link" });
  }
});
