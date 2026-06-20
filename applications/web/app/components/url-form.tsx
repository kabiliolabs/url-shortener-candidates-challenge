import { Form, useNavigation } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

/**
 * Controlled-by-the-router creation form. Submits a POST to the index action.
 * Uses `useNavigation` to reflect the in-flight state (disabled + label swap)
 * so the user gets immediate feedback while the request is running.
 */
export function UrlForm({ error }: { error?: string }) {
  const navigation = useNavigation();
  const isSubmitting =
    navigation.state === "submitting" && navigation.formMethod === "POST";

  return (
    <Form method="post" className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="url">URL to shorten</Label>
        <div className="flex gap-2">
          <Input
            id="url"
            name="url"
            type="url"
            inputMode="url"
            placeholder="https://example.com/very/long/link"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "url-error" : undefined}
            required
            disabled={isSubmitting}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Shortening…" : "Shorten"}
          </Button>
        </div>
        {error && (
          <p id="url-error" className="text-sm text-[var(--color-destructive)]">
            {error}
          </p>
        )}
      </div>
    </Form>
  );
}
