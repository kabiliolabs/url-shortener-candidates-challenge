import { useEffect, useState } from "react";
import { useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/_index";

import { toBase62 } from "~/lib/base62";
import { getClientIp, rateLimitOrThrow } from "~/lib/rate-limit.server";
import { applyTheme, getInitialTheme, type Theme } from "~/lib/theme.client";
import { createShortUrl, deleteShortUrl, listShortUrls, setShortCode } from "~/server/short-url.repository";

import { CreateShortLinkCard } from "~/components/create-short-link-card";
import { HeaderBar } from "~/components/header-bar";
import { LinksTableCard } from "~/components/links-table-card";

type ActionData =
  | { ok: true; shortenedUrl?: string }
  | { ok: false; error: string };

function isValidHttpUrl(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  const origin = new URL(request.url).origin;

  const items = await listShortUrls();

  return {
    baseUrl: `${origin}/s/`,
    items: items.map((i) => ({
      ...i,
      createdAt: i.createdAt.toISOString(),
    })),
  };
}

export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    const intent = String(formData.get("intent") ?? "create");

    if (intent === "delete") {
      const idRaw = String(formData.get("id") ?? "");
      const id = Number(idRaw);

      if (!Number.isFinite(id)) {
        return { ok: false, error: "Invalid id." } satisfies ActionData;
      }
      const res = await deleteShortUrl(id);

      if (!res.ok) {
        if (res.reason === "NOT_FOUND") {
          return { ok: false, error: "This link was already deleted." } satisfies ActionData;
        }
        return { ok: false, error: "Could not delete the link. Please try again." } satisfies ActionData;
      }

      return { ok: true } satisfies ActionData;
    }

    const ip = getClientIp(request);
    rateLimitOrThrow(ip, 10, 60_000);

    const url = String(formData.get("url") ?? "").trim();

    if (!url) {
      return { ok: false, error: "URL is required." } satisfies ActionData;
    }

    if (!isValidHttpUrl(url)) {
      return {
        ok: false,
        error: "Please enter a valid http/https URL.",
      } satisfies ActionData;
    }

    const created = await createShortUrl(url);

    const code = toBase62(created.id);

    await setShortCode(created.id, code);

    const origin = new URL(request.url).origin;
    return {
      ok: true,
      shortenedUrl: `${origin}/s/${code}`,
    } satisfies ActionData;
  } catch (err: any) {
    if (err instanceof Response) throw err;
    return {
      ok: false,
      error: "Unexpected error. Please try again.",
    } satisfies ActionData;
  }
}

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "URL Shortener" },
    { name: "description", content: "Shorten your URLs and track clicks" },
  ];
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { baseUrl, items } = loaderData as {
    baseUrl: string;
    items: Array<{
      id: number;
      code: string | null;
      originalUrl: string;
      clicks: number;
      createdAt: string;
    }>;
  };

  const actionData = useActionData<ActionData>();
  const nav = useNavigation();
  const isSubmitting = nav.state === "submitting";

  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => {
    const t = getInitialTheme();
    setTheme(t);
    applyTheme(t);
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  const glassCard =
    "border bg-background/70 supports-[backdrop-filter]:bg-background/55 backdrop-blur-xl shadow-sm";

  return (
    <main className="min-h-screen text-foreground">
      <div
        className="
          pointer-events-none fixed inset-0 -z-10
          bg-linear-to-b from-background via-background to-muted/30
          dark:from-background dark:via-background dark:to-muted/10
        "
      />
      <div
        className="
          pointer-events-none fixed inset-0 -z-10
          bg-[radial-gradient(1200px_circle_at_20%_10%,hsl(var(--primary)/0.08),transparent_55%)]
          dark:bg-[radial-gradient(1200px_circle_at_20%_10%,hsl(var(--primary)/0.10),transparent_60%)]
        "
      />
      <div
        className="
          pointer-events-none fixed inset-0 -z-10
          bg-[radial-gradient(900px_circle_at_80%_30%,hsl(var(--secondary)/0.06),transparent_60%)]
          dark:bg-[radial-gradient(900px_circle_at_80%_30%,hsl(var(--secondary)/0.07),transparent_65%)]
        "
      />

      <div className="mx-auto max-w-5xl px-4 py-8">
        <HeaderBar baseUrl={baseUrl} theme={theme} onToggleTheme={toggleTheme} />

        <div className="mt-6 grid gap-6">
          <CreateShortLinkCard
            glassCardClassName={glassCard}
            isSubmitting={isSubmitting}
            actionData={actionData}
          />

          <LinksTableCard glassCardClassName={glassCard} items={items} />
        </div>

        <footer className="mt-8 text-xs text-muted-foreground">
          Built with React Router v7 + Prisma + PostgreSQL.
        </footer>
      </div>
    </main>
  );
}
