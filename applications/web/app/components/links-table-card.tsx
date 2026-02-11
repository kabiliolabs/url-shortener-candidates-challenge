import { useMemo, useState } from "react";
import { Form } from "react-router";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

type Item = {
  id: number;
  code: string | null;
  originalUrl: string;
  clicks: number;
  createdAt: string;
};

type Props = {
  glassCardClassName: string;
  items: Item[];
};

export function LinksTableCard({ glassCardClassName, items }: Props) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter((i) => i.originalUrl.toLowerCase().includes(query));
  }, [q, items]);

  return (
    <Card className={glassCardClassName}>
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Your links</CardTitle>
          <div className="w-full sm:w-80">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter by original URL..."
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Showing <span className="font-medium">{filtered.length}</span> / {items.length}
          </span>
          <span className="hidden sm:inline">Last 200</span>
        </div>

        <Separator className="my-4" />

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Original</TableHead>
                <TableHead>Short</TableHead>
                <TableHead className="w-[22.5]">Clicks</TableHead>
                <TableHead className="w-[47.5]">Created</TableHead>
                <TableHead className="w-[22.5]" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No links found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((i) => {
                  const shortPath = i.code ? `/s/${i.code}` : "";
                  return (
                    <TableRow key={i.id}>
                      <TableCell className="max-w-[105] truncate">
                        <a
                          className="underline underline-offset-4"
                          href={i.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {i.originalUrl}
                        </a>
                      </TableCell>

                      <TableCell>
                        {i.code ? (
                          <a
                            className="underline underline-offset-4"
                            href={shortPath}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {shortPath}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge variant="secondary">{i.clicks}</Badge>
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {new Date(i.createdAt).toLocaleString()}
                      </TableCell>

                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="cursor-pointer">
                              Delete
                            </Button>
                          </AlertDialogTrigger>

                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this link?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove the short link and its stats. This action can’t be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                              <AlertDialogCancel className="cursor-pointer">
                                Cancel
                              </AlertDialogCancel>

                              <Form method="post">
                                <input type="hidden" name="intent" value="delete" />
                                <input type="hidden" name="id" value={i.id} />
                                <AlertDialogAction asChild>
                                  <Button type="submit" variant="destructive" className="cursor-pointer">
                                    Delete
                                  </Button>
                                </AlertDialogAction>
                              </Form>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
