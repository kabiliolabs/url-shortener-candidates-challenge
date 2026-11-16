import { z } from "zod";
import { assertShortenable } from "../domain/assert-shortenable";
import { InvalidUrlError } from "../domain/errors";
import { ownHostname } from "./config";

export function createShortenRequestSchema(hostname?: string) {
  return z.object({
    url: z.string({ error: "URL is required" }).superRefine((url, ctx) => {
      try {
        assertShortenable(url, hostname);
      } catch (error) {
        if (!(error instanceof InvalidUrlError)) {
          throw error;
        }
        ctx.addIssue({ code: "custom", message: error.message });
      }
    }),
  });
}

export const shortenRequestSchema = createShortenRequestSchema(ownHostname);

export type ShortenRequest = z.infer<typeof shortenRequestSchema>;

export function parseShortenRequest(
  input: unknown,
  schema = shortenRequestSchema,
): ShortenRequest {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new InvalidUrlError(result.error.issues[0].message);
  }

  return result.data;
}
