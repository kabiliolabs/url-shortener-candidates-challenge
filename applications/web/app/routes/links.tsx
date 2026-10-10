import type { Route } from "./+types/links";
import { container } from "~/.server/container";
import { LinksTable } from "~/components/links-table";
import { Card } from "~/components/ui/card";

export async function loader() {
  const links = await container.listShortLinks.execute();
  return {
    baseUrl: `${container.publicUrl}/s/`,
    links: links.map((link) => ({
      code: link.code,
      destination: link.destination,
      createdAt: link.createdAt.toISOString(),
      clickCount: link.clickCount,
    })),
  };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Your links | URL Shortener" },
    { name: "description", content: "Short links and their click statistics" },
  ];
}

export default function Links({ loaderData }: Route.ComponentProps) {
  const { baseUrl, links } = loaderData;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-slate-900">Your links</h1>
        <p className="text-slate-600">
          Every short link you created and how often it was visited.
        </p>
      </header>
      <Card className="p-2 sm:p-4">
        <LinksTable links={links} baseUrl={baseUrl} />
      </Card>
    </div>
  );
}
