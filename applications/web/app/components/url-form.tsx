import { Form } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";

type UrlFormProps = {
  baseUrl: string;
  error: string | undefined;
};

export function UrlForm({ baseUrl, error }: UrlFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>URL Shortener</CardTitle>
        <CardDescription>
          Enter a long URL to get a short link. Short links start with {baseUrl}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="post" className="flex flex-col gap-4">
          <Input
            type="url"
            name="url"
            placeholder="https://example.com"
            required
            aria-invalid={error ? true : undefined}
          />
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit">Shorten URL</Button>
        </Form>
      </CardContent>
    </Card>
  );
}
