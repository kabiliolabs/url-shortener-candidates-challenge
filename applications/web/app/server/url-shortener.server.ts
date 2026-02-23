import { createUrlShortenerApplication } from "@url-shortener/engine";

const baseUrl = process.env.PUBLIC_URL ?? "http://localhost:5173";
const maxCreatePerMinute = Number(process.env.MAX_CREATE_PER_MINUTE ?? "20");

export const urlShortenerApplication = createUrlShortenerApplication({
  baseUrl,
  maxCreatePerMinute,
});
