import type { Route } from "./+types/route";
import { data } from "react-router";
import { ShortenerController } from "./shortener.controller";
import {
  baseUrl,
  shortenedUrls,
  generateShortCode,
  ShortenedURL,
  URL,
} from "@url-shortener/engine";
import type { URLValidationError } from "@url-shortener/engine";

type ShorteningActionData =
  | { shortenedUrl: string; error?: never; code?: never }
  | { error: string; code: URLValidationError["code"]; shortenedUrl?: never };

export function loader() {
  return {
    baseUrl: baseUrl ? baseUrl + "/s/" : "-",
  };
}

export async function action({ request }: Route.ActionArgs): Promise<
  ShorteningActionData | ReturnType<typeof data<ShorteningActionData>>
> {
  const formData = await request.formData();
  const input = formData.get("url");

  if (input === null) {
    return data(
      { error: "URL is required", code: "required" },
      { status: 400 },
    );
  }

  if (typeof input !== "string") {
    return data(
      {
        error: "Enter a complete, valid URL starting with http:// or https://.",
        code: "invalid_url",
      },
      { status: 400 },
    );
  }

  const result = URL.safeParse(input);

  if (!result.ok) {
    return data(
      { error: result.error.message, code: result.error.code },
      { status: 400 },
    );
  }

  const shortCode = generateShortCode();
  const shortened = new ShortenedURL(shortCode, result.value);

  shortenedUrls.set(shortened.code, shortened.destination.value);

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
