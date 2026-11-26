import { useEffect } from "react";
import { listShortLinks } from "@url-shortener/engine";
import { Link, useRevalidator } from "react-router";
import { shortLinkRepository } from "~/prisma-short-link-repository.server";
import { shortLinkFor } from "~/public-url.server";
import type { Route } from "./+types/links";

export async function loader() {
  const links = await listShortLinks(shortLinkRepository);

  return {
    links: links.map((link) => ({
      code: link.code,
      shortUrl: shortLinkFor(link.code),
      url: link.url,
      clicks: link.clicks,
    })),
  };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Latest links" },
    { name: "description", content: "Latest shortened links" },
  ];
}

export default function Links({ loaderData }: Route.ComponentProps) {
  const { links } = loaderData;
  const { revalidate } = useRevalidator();

  useEffect(() => {
    function refreshWhenVisible() {
      if (document.visibilityState !== "visible") {
        return;
      }
      revalidate();
    }

    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [revalidate]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-lime-400 via-pink-500 to-cyan-300 py-12">
      <div className="bg-yellow-300 p-12 rounded-none border-8 border-dashed border-purple-600 w-full max-w-lg rotate-1 shadow-2xl shadow-red-500">
        <Link
          to="/"
          prefetch="none"
          className="inline-block px-4 py-1.5 text-sm bg-red-500 hover:bg-lime-500 text-yellow-200 border-4 border-teal-400 rounded-full skew-x-3 cursor-pointer"
        >
          ★ BACK ★
        </Link>

        <h1 className="text-4xl font-mono italic text-center mt-8 mb-8 text-fuchsia-600 underline decoration-wavy decoration-green-500 tracking-widest">
          ~*~ Latest links ~*~
        </h1>

        {links.length === 0 ? (
          <p className="text-center text-indigo-800 font-bold bg-cyan-200 p-2 border-2 border-dotted border-orange-500">
            No links yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {links.map((link) => (
              <li
                key={link.code}
                className="flex flex-col gap-1 bg-orange-200 border-4 border-blue-600 p-3 text-purple-800"
              >
                <a
                  href={link.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all font-mono underline"
                >
                  {link.shortUrl}
                </a>
                <span className="break-all text-sm">{link.url}</span>
                <span className="text-sm font-bold">{link.clicks} clicks</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
