import { z } from "zod";
import { assertShortenable, InvalidUrlError } from "@url-shortener/engine/domain";

// Client-side convenience only: the server re-validates every request with the same predicate.
export function createUrlFormSchema(ownHostname?: string) {
  return z.object({
    url: z.string().superRefine((url, ctx) => {
      try {
        assertShortenable(url, ownHostname);
      } catch (error) {
        if (!(error instanceof InvalidUrlError)) {
          throw error;
        }
        ctx.addIssue({ code: "custom", message: error.message });
      }
    }),
  });
}

export type UrlFormValues = z.infer<ReturnType<typeof createUrlFormSchema>>;
