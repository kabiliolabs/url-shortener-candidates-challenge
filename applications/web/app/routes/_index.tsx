import { useRef } from "react";
import { Form, useActionData } from "react-router";
import type { Route } from "./+types/_index";
import { validateUrl, shortenUrl, listUrls } from "~/server/services/url.service.server";
import { truncateUrl, formatDate } from "~/services/url.helpers";
import { urlRepository } from "~/server/repositories/index.server";
import { verifyRecaptcha } from "~/server/services/recaptcha.service.server";

export async function loader() {
  const baseUrl = (process.env.PUBLIC_URL ?? "http://localhost:5173") + "/s/";
  const urls = await listUrls(urlRepository);
  return { baseUrl, urls };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const url = formData.get("url") as string;

  const recaptchaToken = formData.get("recaptcha_token") as string;
  if (!recaptchaToken) {
    return { error: "Bot verification failed — please try again" };
  }
  const recaptcha = await verifyRecaptcha(recaptchaToken);
  if (!recaptcha.success) {
    return { error: "Bot check failed — please try again" };
  }

  const error = validateUrl(url);
  if (error) {
    return { error };
  }

  const result = await shortenUrl(url, urlRepository);
  const baseUrl = process.env.PUBLIC_URL ?? "http://localhost:5173";
  const fullShortUrl = `${baseUrl}/s/${result.shortCode}`;

  return { shortenedUrl: fullShortUrl };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "URL Shortener" },
    { name: "description", content: "Shorten your URLs quickly and easily" },
  ];
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { baseUrl, urls } = loaderData;
  const actionData = useActionData<typeof action>();
  const tokenRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (submittingRef.current) {
      submittingRef.current = false;
      return;
    }
    e.preventDefault();

    const form = e.currentTarget;
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

    if (window.grecaptcha && siteKey) {
      try {
        const token = await window.grecaptcha.execute(siteKey, { action: "shorten" });
        if (tokenRef.current) {
          tokenRef.current.value = token;
        }
      } catch (err) {
        console.error("reCAPTCHA failed:", err);
      }
    }

    submittingRef.current = true;
    form.requestSubmit();
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lime-400 via-pink-500 to-cyan-300">
      <div className="bg-yellow-300 p-12 rounded-none border-8 border-dashed border-purple-600 w-full max-w-lg rotate-1 shadow-2xl shadow-red-500">
        <h1 className="text-4xl font-mono italic text-center mb-8 text-fuchsia-600 underline decoration-wavy decoration-green-500 tracking-widest">
          ~*~ URL Shortener ~*~
        </h1>

        <Form method="post" onSubmit={handleSubmit} className="flex flex-col gap-6">
          <input type="hidden" name="recaptcha_token" ref={tokenRef} />
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

        {urls.length > 0 && (
          <div className="mt-10 p-4 bg-teal-300 border-4 border-dotted border-fuchsia-600 rotate-[-0.5deg]">
            <h2 className="text-2xl font-mono text-orange-700 underline decoration-wavy decoration-blue-500 mb-4 text-center tracking-wide">
              ★ All Shortened URLs ★
            </h2>
            <div className="space-y-3">
              {urls.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-pink-200 border-2 border-dashed border-indigo-500 p-3 rounded-none"
                >
                  <p className="font-mono text-purple-700 text-lg font-bold">
                    /{entry.shortCode}
                  </p>
                  <p
                    className="text-sm text-blue-900 break-all bg-yellow-100 p-1 border border-red-400"
                    title={entry.originalUrl}
                  >
                    → {truncateUrl(entry.originalUrl)}
                  </p>
                  <div className="flex justify-between mt-2 text-xs font-bold">
                    <span className="bg-lime-400 text-fuchsia-800 px-2 py-1 border border-orange-500">
                      🖱 {entry.clickCount} clicks
                    </span>
                    <span className="bg-violet-300 text-green-900 px-2 py-1 border border-cyan-500">
                      📅 {formatDate(entry.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
