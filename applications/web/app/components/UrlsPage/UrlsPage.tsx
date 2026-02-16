import { useEffect, useState } from "react";
import { useAtom, useSetAtom } from "jotai";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import BarChartIcon from "@mui/icons-material/BarChart";
import { urlListAtom, loadUrlList } from "../../state/index.js";
import { getListUrlsErrorMessage } from "../../api/error-messages.js";
import { formatDate } from "../../utils/date.js";

export function UrlsPage(): React.JSX.Element {
  const [urls, setUrls] = useAtom(urlListAtom);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    loadUrlList(setUrls)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load URLs"))
      .finally(() => setLoading(false));
  }, [setUrls]);

  const handleShortLinkClick = (shortCode: string) => {
    setUrls((prev) => {
      const index = prev.findIndex((row) => row.shortCode === shortCode);
      if (index === -1) return prev;
      const next = [...prev];
      next[index] = { ...next[index], clicks: next[index].clicks + 1 };
      return next;
    });
  };

  const errorMessage = error ? getListUrlsErrorMessage(error) : null;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <CircularProgress className="text-primary" />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="mx-auto max-w-[560px]">
        <Alert severity="error">{errorMessage}</Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[960px]">
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-primary">
        All URLs
      </h1>
      <p className="mb-6 text-sm text-text-secondary">
        Short links and click statistics.
      </p>

      <TableContainer component={Paper} elevation={0}>
        <Table size="small" aria-label="Shortened URLs">
          <TableHead>
            <TableRow>
              <TableCell className="font-semibold text-text-secondary">Short code</TableCell>
              <TableCell className="font-semibold text-text-secondary">Original URL</TableCell>
              <TableCell className="font-semibold text-text-secondary" align="right">
                Clicks
              </TableCell>
              <TableCell className="font-semibold text-text-secondary">Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {urls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" className="py-10 text-text-secondary">
                  No shortened URLs yet. Create one from the home page.
                </TableCell>
              </TableRow>
            ) : (
              urls.map((row) => (
                <TableRow key={row.id} className="hover:bg-white/[0.02]">
                  <TableCell>
                    <a
                      href={`/s/${row.shortCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-secondary no-underline hover:underline"
                      onClick={() => handleShortLinkClick(row.shortCode)}
                    >
                      /s/{row.shortCode}
                    </a>
                  </TableCell>
                  <TableCell className="max-w-[280px]">
                    <span
                      className="block truncate font-mono text-[0.85rem] text-text-secondary"
                      title={row.originalUrl}
                    >
                      {row.originalUrl}
                    </span>
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-1">
                      <BarChartIcon className="text-lg text-text-secondary" />
                      <span className="text-sm text-text-primary">{row.clicks}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[0.85rem] text-text-secondary">
                    {formatDate(row.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
