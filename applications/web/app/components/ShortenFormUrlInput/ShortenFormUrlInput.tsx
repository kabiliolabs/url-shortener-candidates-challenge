import { useAtom } from "jotai";
import { UrlInputField } from "../UrlInputField";
import {
  shortenFormUrlAtom,
  shortenFormErrorAtom,
  shortenFormCopyErrorAtom,
  shortenFormLoadingAtom,
  lastShortenedUrlAtom,
} from "../../state/index.js";
import { getCopyErrorMessage } from "../../api/error-messages.js";

export function ShortenFormUrlInput(): React.JSX.Element {
  const [url, setUrl] = useAtom(shortenFormUrlAtom);
  const [shortenError] = useAtom(shortenFormErrorAtom);
  const [copyError] = useAtom(shortenFormCopyErrorAtom);
  const [loading] = useAtom(shortenFormLoadingAtom);
  const [shortenedUrl] = useAtom(lastShortenedUrlAtom);

  const helperText = shortenError ?? (copyError ? getCopyErrorMessage() : undefined);
  const showError = !!(shortenError || copyError) && !shortenedUrl;

  return (
    <UrlInputField
      value={url}
      onChange={setUrl}
      error={showError}
      helperText={helperText}
      disabled={loading}
    />
  );
}
