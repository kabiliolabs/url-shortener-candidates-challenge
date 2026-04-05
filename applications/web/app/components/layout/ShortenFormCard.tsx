import { Form, useNavigation } from "react-router";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";

type ShortenFormCardProps = {
  baseUrl: string;
};

export function ShortenFormCard({ baseUrl }: ShortenFormCardProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Card className="shadow-lg ring-1 ring-foreground/10">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl tracking-tight">Create a short link</CardTitle>
        <CardDescription>
          Paste a long URL. We&apos;ll return a compact link you can share anywhere.
        </CardDescription>
      </CardHeader>
      <Form method="post" className="contents">
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Destination URL</Label>
            <Input
              id="url"
              name="url"
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder="https://example.com/your/long/path"
              required
              disabled={isSubmitting}
            />
          </div>
        </CardContent>
        <Separator />
        <CardFooter className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="whitespace-nowrap">Short links use</span>
            <Badge variant="secondary" className="font-mono text-xs">
              {baseUrl}
            </Badge>
          </div>
          <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
            {isSubmitting ? "Shortening…" : "Shorten URL"}
          </Button>
        </CardFooter>
      </Form>
    </Card>
  );
}
