import { useState } from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LinkIcon from "@mui/icons-material/Link";
import { shortenUrl } from "../api/client.js";

export function meta() {
  return [
    { title: "URL Shortener" },
    { name: "description", content: "Shorten your URLs quickly and easily" },
  ];
}

export default function Index() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setShortenedUrl(null);
    const trimmed = url.trim();
    if (!trimmed) {
      setError("URL is required");
      return;
    }
    setLoading(true);
    try {
      const res = await shortenUrl(trimmed);
      if ("error" in res) {
        setError(res.error ?? "Unknown error");
        return;
      }
      setShortenedUrl(res.shortenedUrl ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to shorten URL");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!shortenedUrl) return;
    try {
      await navigator.clipboard.writeText(shortenedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy to clipboard");
    }
  }

  return (
    <Box
      sx={{
        maxWidth: 560,
        mx: "auto",
        pt: { xs: 2, md: 4 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          border: "1px solid",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: 700, letterSpacing: "-0.02em", color: "primary.main" }}
        >
          Shorten a URL
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Enter a long URL and get a short link. Clicks are tracked.
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="URL"
            placeholder="https://example.com/very/long/url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
            error={!!error && !shortenedUrl}
            helperText={error && !shortenedUrl ? error : undefined}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LinkIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            size="large"
            sx={{ py: 1.5 }}
          >
            {loading ? "Shortening…" : "Shorten"}
          </Button>
        </form>

        {shortenedUrl && (
          <Alert
            severity="success"
            sx={{
              mt: 3,
              bgcolor: "rgba(0, 230, 118, 0.08)",
              border: "1px solid rgba(0, 230, 118, 0.2)",
              "& .MuiAlert-message": { width: "100%" },
            }}
          >
            <Typography variant="subtitle2" color="success.main" gutterBottom>
              Your shortened URL
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <Typography
                component="a"
                href={shortenedUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  fontFamily: "monospace",
                  fontSize: "0.95rem",
                  color: "primary.light",
                  wordBreak: "break-all",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                {shortenedUrl}
              </Typography>
              <IconButton
                size="small"
                onClick={handleCopy}
                aria-label={copied ? "Copied" : "Copy"}
                sx={{ color: "primary.main" }}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
              {copied && (
                <Typography variant="caption" color="success.main">
                  Copied!
                </Typography>
              )}
            </Box>
          </Alert>
        )}
      </Paper>
    </Box>
  );
}
