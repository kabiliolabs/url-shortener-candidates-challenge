import * as Label from "@radix-ui/react-label";
import { Button, TextField } from "@radix-ui/themes";
import { type SubmitEventHandler, useState } from "react";
import { shortenUrl } from "../lib/api";

type ShortenerFormProps = {
  onShortened: (shortUrl: string) => void;
};

export default function ShortenerForm({ onShortened }: ShortenerFormProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitForm: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError("Please fill out this field");
      return;
    }

    setIsSubmitting(true);

    try {
      const shortUrl = await shortenUrl(url.trim());
      onShortened(shortUrl);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not shorten this URL.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="shortener-form" onSubmit={submitForm}>
      <Label.Root className="field-label" htmlFor="long-url">Long URL</Label.Root>
      <div className="form-row">
        <TextField.Root
          className="url-field"
          id="long-url"
          type="text"
          inputMode="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://example.com/your-long-link"
          autoComplete="url"
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Shortening..." : "Shorten URL"}
        </Button>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
    </form>
  );
}
