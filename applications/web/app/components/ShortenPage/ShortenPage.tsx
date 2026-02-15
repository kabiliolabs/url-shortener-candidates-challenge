import { useAtom, useSetAtom } from "jotai";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { PageSection } from "../PageSection";
import { ContentCard } from "../ContentCard";
import { PageTitle } from "../PageTitle";
import { ShortenFormUrlInput } from "../ShortenFormUrlInput";
import { ShortenFormSubmitButton } from "../ShortenFormSubmitButton";
import { useShortenUrl, useCopyToClipboard } from "../../hooks/index.js";
import { lastShortenedUrlAtom, shortenFormCopyErrorAtom } from "../../state/index.js";
import { getCopyErrorMessage } from "../../api/error-messages.js";

export function ShortenPage(): React.JSX.Element {
  const { submit } = useShortenUrl();
  const { copy, copied } = useCopyToClipboard();
  const [shortenedUrl] = useAtom(lastShortenedUrlAtom);
  const setCopyError = useSetAtom(shortenFormCopyErrorAtom);

  function handleSubmit(e: React.FormEvent) {
    setCopyError(null);
    submit(e);
  }

  async function handleCopyShortened() {
    if (!shortenedUrl) return;
    try {
      await copy(shortenedUrl);
    } catch {
      setCopyError(getCopyErrorMessage());
    }
  }

  return (
    <PageSection>
      <ContentCard>
        <PageTitle
          title="Shorten a URL"
          subtitle={'Enter a long URL (e.g. https://example.com or example.com), then click Shorten. Share the short link; visits are counted. Use "All URLs" in the bar above to see the list.'}
        />
        <form onSubmit={handleSubmit}>
          <ShortenFormUrlInput />
          <div className="mt-4 mb-4">
            <ShortenFormSubmitButton />
          </div>
          {shortenedUrl && (
            <TextField
              fullWidth
              label="Shortened URL"
              value={shortenedUrl}
              inputProps={{ readOnly: true, "aria-label": "Shortened URL" }}
              InputProps={{
                readOnly: true,
                className: "font-mono text-[0.95rem]",
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleCopyShortened}
                      aria-label={copied ? "Copied" : "Copy"}
                      size="small"
                      className="text-primary"
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                    {copied && (
                      <span className="ml-1 text-xs text-success">Copied!</span>
                    )}
                  </InputAdornment>
                ),
              }}
              className="mt-0"
            />
          )}
        </form>
      </ContentCard>
    </PageSection>
  );
}
