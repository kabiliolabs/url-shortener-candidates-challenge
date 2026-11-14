import type { Route } from "./+types/route";
import { ShortenerController } from "./shortener.controller";
import {
  baseUrl,
  shortenedUrls,
  generateShortCode,
} from "@url-shortener/engine";

export function loader() {
  return {
    baseUrl: baseUrl ? baseUrl + "/s/" : "-",
  };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const url = formData.get("url") as string;

  if (!url) {
    return { error: "URL is required" };
  }

  const shortCode = generateShortCode();

  shortenedUrls.set(shortCode, url);

  return {
    shortenedUrl: `${baseUrl}/s/${shortCode}`,
  };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "URL Shortener" },
    { name: "description", content: "Shorten your URLs quickly and easily" },
  ];
}

export default function Index() {
  return <ShortenerController />;
}
