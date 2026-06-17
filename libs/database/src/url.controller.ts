import { generateShortCode } from "@url-shortener/engine";
import type { Url } from "../generated/prisma/browser.js";
import { prisma } from "./prisma.js";

export async function createUrl(fullUrl: string): Promise<Url> {
    const existingUrl = await prisma.url.findUnique({
        where: { url: fullUrl },
    });

    /**
     * If the URL already exists, update the record
     */
    if (existingUrl) {
        await prisma.url.update({
            where: { id: existingUrl.id },
            data: { shortenCount: existingUrl.shortenCount + 1 },
        });
        return existingUrl;
    }

    /**
     * If the URL does not exist, create a new record
     */
    const shortCode = generateShortCode();

    const record = await prisma.url.create({
        data: {
            url: fullUrl,
            shortCode,
        },
    });
    console.log("Created url:", record);
    return record;
}

export async function getAllUrls(): Promise<Url[]> {
    return await prisma.url.findMany();
}