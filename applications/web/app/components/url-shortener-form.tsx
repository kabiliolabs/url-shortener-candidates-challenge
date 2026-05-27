import { Form, useNavigation } from "react-router";
import { Button } from "./ui/button";
import { TextField } from "./ui/text-field";

interface UrlShortenerFormProps {
  baseUrl: string;
  error?: string;
}

export function UrlShortenerForm({ baseUrl, error }: UrlShortenerFormProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Form className="grid gap-4" method="post">
      <TextField
        autoComplete="url"
        disabled={isSubmitting}
        error={error}
        hint={`Short URLs start with ${baseUrl}`}
        label="URL"
        name="url"
        placeholder="https://example.com/article"
        required
        type="url"
      />
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? "Shortening..." : "Shorten URL"}
      </Button>
    </Form>
  );
}
