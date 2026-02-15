import type { Route } from "./+types/api.shorten";
import { baseUrl } from "@url-shortener/engine";
import { shortenUrl } from "../services/shortened-url.server.js";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const url = typeof body?.url === "string" ? body.url.trim() : "";
  if (!url) {
    return Response.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const { code } = await shortenUrl(url);
    const shortenedUrl = baseUrl ? `${baseUrl}/s/${code}` : "";
    return Response.json({ shortenedUrl });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to shorten URL";
    return Response.json({ error: message }, { status: 400 });
  }
}

export default function ApiShorten() {
  return null;
}
