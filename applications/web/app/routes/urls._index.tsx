import { useState, useEffect } from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Link from "@mui/material/Link";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import BarChartIcon from "@mui/icons-material/BarChart";
import { listUrls } from "../api/client.js";
import type { ShortenedUrlDto } from "../api/types.js";

export function meta() {
  return [
    { title: "All URLs | URL Shortener" },
    { name: "description", content: "View all shortened URLs and click statistics" },
  ];
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function UrlsIndex() {
  const [urls, setUrls] = useState<ShortenedUrlDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listUrls()
      .then((res) => {
        if (!cancelled) setUrls(res.urls);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load URLs");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress sx={{ color: "primary.main" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 560, mx: "auto" }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 960, mx: "auto" }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: 700, letterSpacing: "-0.02em", color: "primary.main", mb: 2 }}
      >
        All URLs
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Short links and click statistics.
      </Typography>

      <TableContainer component={Paper} elevation={0}>
        <Table size="small" aria-label="Shortened URLs">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>Short code</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>Original URL</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "text.secondary" }} align="right">
                Clicks
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {urls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  No shortened URLs yet. Create one from the home page.
                </TableCell>
              </TableRow>
            ) : (
              urls.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{
                    "&:hover": { bgcolor: "rgba(255,255,255,0.02)" },
                  }}
                >
                  <TableCell>
                    <Link
                      href={`/s/${row.code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        fontFamily: "monospace",
                        color: "secondary.main",
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      /s/{row.code}
                    </Link>
                    <OpenInNewIcon
                      sx={{ fontSize: 14, ml: 0.5, verticalAlign: "middle", color: "text.disabled" }}
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 280 }}>
                    <Typography
                      noWrap
                      title={row.url}
                      sx={{
                        fontFamily: "monospace",
                        fontSize: "0.85rem",
                        color: "text.secondary",
                      }}
                    >
                      {row.url}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5 }}>
                      <BarChartIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                      <Typography component="span" variant="body2" color="text.primary">
                        {row.clickCount}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                    {formatDate(row.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
