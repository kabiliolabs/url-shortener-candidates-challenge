import { Form, useActionData, data } from "react-router";
import type { Route } from "./+types/_index";
import { InvalidUrlError } from "@url-shortener/engine";
import { baseUrl } from "../.server/config";
import { createShortUrl } from "../.server/short-url";
import {
  createShortUrlRateLimiter,
  getClientIp,
} from "../.server/rate-limit";

type ActionData = { shortenedUrl?: string; error?: string };

export function loader() {
  return { baseUrl: `${baseUrl}/s/` };
}

export async function action({ request }: Route.ActionArgs) {
  if (!createShortUrlRateLimiter.tryConsume(getClientIp(request))) {
    return data<ActionData>(
      { error: "Too many requests. Please slow down and try again shortly." },
      { status: 429 },
    );
  }

  const formData = await request.formData();
  const url = (formData.get("url") ?? "").toString().trim();

  if (!url) {
    return data<ActionData>({ error: "URL is required" }, { status: 400 });
  }

  try {
    const created = await createShortUrl({ url });
    const result: ActionData = { shortenedUrl: `${baseUrl}/s/${created.code}` };
    return result;
  } catch (error) {
    if (error instanceof InvalidUrlError) {
      return data<ActionData>(
        { error: "Please enter a valid http:// or https:// URL." },
        { status: 400 },
      );
    }
    console.error("Failed to create short URL", error);
    return data<ActionData>(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "URL Shortener" },
    { name: "description", content: "Shorten your URLs quickly and easily" },
  ];
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { baseUrl } = loaderData;
  const actionData = useActionData<typeof action>();

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-lime-400 via-pink-500 to-cyan-300">
      <div className="bg-yellow-300 p-12 rounded-none border-8 border-dashed border-purple-600 w-full max-w-lg rotate-1 shadow-2xl shadow-red-500">
        <h1 className="text-4xl font-mono italic text-center mb-8 text-fuchsia-600 underline decoration-wavy decoration-green-500 tracking-widest">
          ~*~ URL Shortener ~*~
        </h1>

        <Form method="post" className="flex flex-col gap-6">
          <input
            type="text"
            name="url"
            placeholder="Enter your URL here..."
            required
            className="w-full px-4 py-3 text-base bg-orange-200 border-4 border-blue-600 text-purple-800 placeholder-red-400 rounded focus:outline-none"
          />

          <div>
            <button
              type="submit"
              className="w-full px-4 py-3 text-base bg-red-500 hover:bg-lime-500 text-yellow-200 border-4 border-teal-400 rounded-full skew-x-3 cursor-pointer"
            >
              ★ SHORTEN IT ★
            </button>
            <p className="text-sm text-indigo-800 mt-3 text-center font-bold bg-cyan-200 p-2 border-2 border-dotted border-orange-500">
              Your shortened URL will start with {baseUrl}
            </p>
          </div>
        </Form>

        {actionData?.shortenedUrl && (
          <div className="mt-8 p-4 bg-violet-400 rounded-3xl border-4 border-double border-yellow-500 -rotate-1">
            <p className="text-lg text-lime-300 mb-2 font-black uppercase">
              Your shortened URL:
            </p>
            <a
              href={actionData.shortenedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-200 break-all font-mono text-xl hover:text-blue-900 bg-pink-600 p-2 block"
            >
              {actionData.shortenedUrl}
            </a>
          </div>
        )}

        {actionData?.error && (
          <div className="mt-8 p-4 bg-lime-500 rounded-none border-8 border-solid border-red-700">
            <p className="text-2xl text-blue-800 font-black">
              {actionData.error}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
