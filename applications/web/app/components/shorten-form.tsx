import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { Form, useNavigation } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface ShortenFormProps {
  error?: string;
  shortenedUrl?: string;
}

export function ShortenForm({ error, shortenedUrl }: ShortenFormProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the field after a successful submission.
  useEffect(() => {
    if (shortenedUrl) formRef.current?.reset();
  }, [shortenedUrl]);

  return (
    <Form method="post" ref={formRef} className="space-y-2">
      <label htmlFor="url" className="sr-only">
        URL to shorten
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          id="url"
          name="url"
          type="text"
          inputMode="url"
          autoComplete="off"
          placeholder="https://example.com/a/very/long/link"
          required
          readOnly={isSubmitting}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "url-error" : undefined}
        />
        <Button type="submit" disabled={isSubmitting} className="sm:w-40">
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Shortening…
            </>
          ) : (
            "Shorten"
          )}
        </Button>
      </div>
      {error && (
        <p id="url-error" role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </Form>
  );
}