import { Link } from "react-router";
import { listShortUrls } from "~/.server/container";
import { shortUrlFor } from "~/.server/env";
import { CopyButton } from "~/components/copy-button";
import { buttonVariants } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/stats";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Stats · URL Shortener" }];
}

/** Paginated list of links with their clicks (SPEC-005). */
export async function loader({ request }: Route.LoaderArgs) {
  const page = Number(new URL(request.url).searchParams.get("page") ?? "1");
  const result = await listShortUrls.execute({ page });
  return {
    ...result,
    items: result.items.map((item) => ({ ...item, shortUrl: shortUrlFor(item.code) })),
  };
}

// Fixed time zone so the server render and the browser hydration show the same text.
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

function formatDate(date: Date | null) {
  return date ? `${dateFormat.format(date)} UTC` : "Never";
}

export default function Stats({ loaderData }: Route.ComponentProps) {
  const { items, page, totalPages, total } = loaderData;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Your links</CardTitle>
        <CardDescription>
          {total === 1 ? "1 link" : `${total} links`}, newest first.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-muted-foreground">No links yet.</p>
            <Link to="/" className={buttonVariants()}>
              Shorten your first link
            </Link>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Short link</TableHead>
                  <TableHead>Original URL</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last click</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.code}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <a
                          href={item.shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono font-medium hover:underline"
                        >
                          /s/{item.code}
                        </a>
                        <CopyButton value={item.shortUrl} />
                      </div>
                    </TableCell>
                    <TableCell className="max-w-64 truncate" title={item.originalUrl}>
                      {item.originalUrl}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {item.clicks}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(item.lastClickedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 ? (
              <nav aria-label="Pagination" className="mt-4 flex items-center justify-between">
                <PageLink page={page - 1} disabled={page <= 1}>
                  Previous
                </PageLink>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <PageLink page={page + 1} disabled={page >= totalPages}>
                  Next
                </PageLink>
              </nav>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function PageLink({
  page,
  disabled,
  children,
}: {
  page: number;
  disabled: boolean;
  children: React.ReactNode;
}) {
  const className = buttonVariants({ variant: "outline", size: "sm" });
  if (disabled) {
    return (
      <span aria-disabled className={cn(className, "pointer-events-none opacity-50")}>
        {children}
      </span>
    );
  }
  return (
    <Link to={`?page=${page}`} className={className}>
      {children}
    </Link>
  );
}
