import { data } from "react-router";
import type { Route } from "./+types/_index";
import { container } from "~/.server/container";
import { toUserError } from "~/.server/present-error";
import { withDefaultScheme } from "~/.server/with-default-scheme";
import { ShortenForm } from "~/components/shorten-form";
import { Card } from "~/components/ui/card";

export function loader() {
  return {
    baseUrl: `${container.publicUrl}/s/`,
  };
}

export async function action({ request }: Route.ActionArgs) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return data({ error: "Invalid form submission" }, { status: 400 });
  }
  const url = formData.get("url");

  if (typeof url !== "string") {
    return data({ error: "URL is required" }, { status: 400 });
  }

  try {
    const { code, destination } = await container.shortenUrl.execute({
      url: withDefaultScheme(url),
    });
    return {
      shortenedUrl: `${container.publicUrl}/s/${code}`,
      destination,
    };
  } catch (error) {
    const message = toUserError(error);
    if (message === null) throw error;
    return data({ error: message }, { status: 400 });
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Shorten a link | URL Shortener" },
    { name: "description", content: "Shorten your URLs quickly and easily" },
  ];
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { baseUrl } = loaderData;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-slate-900">Shorten a link</h1>
        <p className="text-slate-600">
          Paste a long URL and get a short one you can share.
        </p>
      </header>
      <Card>
        <ShortenForm baseUrl={baseUrl} />
      </Card>
    </div>
  );
}
