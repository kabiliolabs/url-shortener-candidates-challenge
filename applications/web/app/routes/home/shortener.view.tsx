import { Form } from "react-router";
import { Button } from "../../components/ui/button/button";
import { Card } from "../../components/ui/card/card";
import { InlineError } from "../../components/ui/inline-error/inline-error";
import { TextInput } from "../../components/ui/text-input/text-input";

type ShortenerViewProps = {
  baseUrl: string;
  shortenedUrl?: string;
  error?: string;
};

export function ShortenerView({ baseUrl, shortenedUrl, error }: ShortenerViewProps) {
  return (
    <main className="page-shell">
      <Card>
        <h1 className="page-title">
          URL Shortener
        </h1>

        <Form method="post" className="shortener-form">
          <TextInput
            type="text"
            name="url"
            placeholder="Enter your URL here..."
            required
          />

          <div className="form-details">
            <Button type="submit">
              SHORTEN IT
            </Button>
            <p className="url-hint">
              Your shortened URL will start with {baseUrl}
            </p>
          </div>
        </Form>

        {shortenedUrl && (
          <Card variant="result">
            <p className="result-label">
              Your shortened URL:
            </p>
            <a
              href={shortenedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="result-link"
            >
              {shortenedUrl}
            </a>
          </Card>
        )}

        {error && <InlineError message={error} />}
      </Card>
    </main>
  );
}
