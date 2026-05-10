import { useRef } from "react";
import { useActionData } from "react-router";
import type { Route } from "./+types/_index";
import { validateUrl, shortenUrl, listUrls, getUrlClicksByDayBatch } from "~/server/services/url.service.server";
import { urlRepository, clickRepository } from "~/server/repositories/index.server";
import { verifyRecaptcha } from "~/server/services/recaptcha.service.server";
import { Alert, Card } from "~/components/ui";
import { ShortenForm } from "~/components/ShortenForm";
import { ShortenedUrlDisplay } from "~/components/ShortenedUrlDisplay";
import { UrlTable } from "~/components/UrlTable";

export async function loader() {
  const baseUrl = (process.env.PUBLIC_URL ?? "http://localhost:5173") + "/s/";
  const urls = await listUrls(urlRepository);

  const urlIds = urls.map((u) => u.id);
  const sparklineMap = await getUrlClicksByDayBatch(urlIds, clickRepository);

  const urlsWithSparklines = urls.map((url) => ({
    ...url,
    sparklineData: (sparklineMap.get(url.id) ?? []).map((d) => d.count),
  }));

  return { baseUrl, urls: urlsWithSparklines };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const url = formData.get("url");
  if (typeof url !== "string") {
    return { error: "URL is required" };
  }

  const recaptchaToken = formData.get("recaptcha_token");
  if (typeof recaptchaToken !== "string" || !recaptchaToken) {
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
  const { urls } = loaderData;
  const actionData = useActionData<typeof action>();
  const submittingRef = useRef(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (submittingRef.current) {
      submittingRef.current = false;
      return;
    }
    e.preventDefault();

    const form = e.currentTarget;
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    const tokenInput = form.querySelector<HTMLInputElement>("#recaptcha-token");

    if (window.grecaptcha && siteKey && tokenInput) {
      try {
        const token = await window.grecaptcha.execute(siteKey, { action: "shorten" });
        tokenInput.value = token;
      } catch (err) {
        console.error("reCAPTCHA failed:", err);
        return;
      }
    }

    submittingRef.current = true;
    form.requestSubmit();
  };

  return (
    <main className="min-h-screen bg-base-200 flex justify-center px-4">
      <div className="w-full max-w-2xl space-y-6 mt-[calc(30vh)]">
        <Card title="URL Shortener">
          <ShortenForm onSubmit={handleSubmit} />

          {actionData?.shortenedUrl && (
            <ShortenedUrlDisplay url={actionData.shortenedUrl} />
          )}

          {actionData?.error && (
            <Alert variant="error">{actionData.error}</Alert>
          )}
        </Card>

        <Card title="Recently shortened URLs">
          <UrlTable urls={urls} baseUrl={loaderData.baseUrl} />
        </Card>
      </div>
    </main>
  );
}
