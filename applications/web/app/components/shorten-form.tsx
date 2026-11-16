import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, useNavigation, useSubmit } from "react-router";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { createUrlFormSchema, type UrlFormValues } from "~/lib/url-form-schema";

interface ShortenFormProps {
  ownHostname?: string;
  shortUrlPrefix: string;
}

export function ShortenForm({ ownHostname, shortUrlPrefix }: ShortenFormProps) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state !== "idle" && navigation.formMethod === "POST";

  const schema = useMemo(() => createUrlFormSchema(ownHostname), [ownHostname]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UrlFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { url: "" },
  });
  const urlError = errors.url?.message;

  return (
    // noValidate: client errors come from the shared schema; without JS the server validates instead.
    <Form
      method="post"
      noValidate
      onSubmit={handleSubmit((values) => submit(values, { method: "post" }))}
      className="grid gap-2"
    >
      <label htmlFor="url" className="text-sm font-medium">
        Long URL
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id="url"
          type="url"
          inputMode="url"
          autoComplete="url"
          placeholder="https://example.com/a/very/long/link"
          aria-invalid={urlError ? true : undefined}
          aria-describedby="url-hint url-error"
          className="h-10"
          {...register("url")}
        />
        <Button type="submit" size="lg" disabled={isSubmitting} className="sm:w-36">
          {isSubmitting ? (
            <>
              <span
                aria-hidden
                className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              />
              Shortening…
            </>
          ) : (
            "Shorten"
          )}
        </Button>
      </div>
      <p id="url-hint" className="text-xs text-muted-foreground">
        Short links start with {shortUrlPrefix}
      </p>
      <div aria-live="polite">
        {urlError && (
          <p id="url-error" className="text-sm text-destructive">
            {urlError}
          </p>
        )}
      </div>
    </Form>
  );
}
