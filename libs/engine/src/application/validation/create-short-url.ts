import { z } from "zod";

const MAX_URL_LENGTH = 2048;

export const createShortUrlSchema = z.object({
  originalUrl: z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : value),
    z
      .string()
      .min(1, "URL is required")
      .max(MAX_URL_LENGTH, `URL must be at most ${MAX_URL_LENGTH} characters`)
      .pipe(
        z.httpUrl("Enter a valid URL starting with http:// or https://"),
      ),
  ),
});

export type CreateShortUrlInput = z.infer<typeof createShortUrlSchema>;
