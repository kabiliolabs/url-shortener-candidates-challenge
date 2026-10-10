import { Link } from "react-router";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export interface LinkRow {
  code: string;
  destination: string;
  createdAt: string;
  clickCount: number;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

function formatDate(iso: string) {
  return `${dateFormatter.format(new Date(iso))} UTC`;
}

export function LinksTable({
  links,
  baseUrl,
}: {
  links: LinkRow[];
  baseUrl: string;
}) {
  if (links.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <p className="font-medium text-slate-900">No links yet</p>
        <p className="text-slate-600">
          Your short links will show up here once you create one.
        </p>
        <Link
          to="/"
          className="font-medium text-indigo-700 underline underline-offset-2 hover:text-indigo-900"
        >
          Create your first link
        </Link>
      </div>
    );
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Short link</TableHeader>
          <TableHeader>Destination</TableHeader>
          <TableHeader className="text-right">Clicks</TableHeader>
          <TableHeader>Created</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {links.map((link) => {
          const shortUrl = `${baseUrl}${link.code}`;
          return (
            <TableRow key={link.code}>
              <TableCell className="whitespace-nowrap">
                <a
                  href={shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-700 underline underline-offset-2 hover:text-indigo-900"
                >
                  {shortUrl}
                </a>
              </TableCell>
              <TableCell className="max-w-xs">
                <span className="block truncate" title={link.destination}>
                  {link.destination}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span className="inline-block min-w-8 rounded-full bg-indigo-100 px-2 py-0.5 text-center text-xs font-medium tabular-nums text-indigo-800">
                  {link.clickCount}
                </span>
              </TableCell>
              <TableCell className="whitespace-nowrap text-slate-600">
                {formatDate(link.createdAt)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
