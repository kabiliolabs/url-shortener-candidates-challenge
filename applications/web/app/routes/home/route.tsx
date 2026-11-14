import type { Route } from "./+types/route";
import { data } from "react-router";
import { ShortenerController } from "./shortener.controller";
import { baseUrl } from "@url-shortener/engine";
import type { ShortenURLError } from "@url-shortener/engine";

import { shortenURL } from "../../bootstrap.server";

type ShorteningActionData =
  | { shortenedUrl: string; error?: never; code?: never }
  | {
      error: string;
      code: ShortenURLError["code"];
      shortenedUrl?: never;
    };

export function loader() {
  return {
    baseUrl: baseUrl ? baseUrl + "/s/" : "-",
  };
}

export async function action({
  request,
}: Route.ActionArgs): Promise<
  ShorteningActionData | ReturnType<typeof data<ShorteningActionData>>
> {
  const formData = await request.formData();
  const result = await shortenURL.execute(formData.get("url"));

  if (!result.ok) {
    return data(
      { error: result.error.message, code: result.error.code },
      {
        status:
          result.error.code === "storage_unavailable" ||
          result.error.code === "code_exhausted"
            ? 503
            : 400,
      },
    );
  }

  return {
    shortenedUrl: `${baseUrl}/s/${result.value.code}`,
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
