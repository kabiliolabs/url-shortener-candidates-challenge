import { shortenUrl } from "@url-shortener/engine";
import { Form, Link, useActionData } from "react-router";
import { shortLinkRepository } from "~/prisma-short-link-repository.server";
import { shortLinkFor, shortLinkPrefix } from "~/public-url.server";
import type { Route } from "./+types/_index";

export async function loader() {
  return {
    baseUrl: shortLinkPrefix(),
  };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const url = formData.get("url");

  if (typeof url !== "string") {
    return { error: "URL is required" };
  }

  const result = await shortenUrl(shortLinkRepository, url);
  if (!result.ok) {
    return { error: result.message };
  }

  return {
    shortenedUrl: shortLinkFor(result.code),
  };
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
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 bg-gradient-to-br from-lime-400 via-pink-500 to-cyan-300 py-12">
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

        <div className="mt-8 flex justify-center">
          <Link
            to="/links"
            prefetch="none"
            className="px-4 py-1.5 text-sm bg-red-500 hover:bg-lime-500 text-yellow-200 border-4 border-teal-400 rounded-full skew-x-3 cursor-pointer"
          >
            ★ LATEST LINKS ★
          </Link>
        </div>
      </div>
    </main>
  );
}
