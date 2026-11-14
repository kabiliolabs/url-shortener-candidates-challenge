import { shortenURLInputSchema } from "../validations/shorten-url.validation";
import { ShortenedURL } from "../../domain/shortened-url";
import type { ShortenedURLValidationError } from "../../domain/shortened-url";
import { generateShortCode, shortenedUrls } from "../../shortened-url";
import { Err } from "../../../../shared/types/result";
import type { Result } from "../../../../shared/types/result";

export class ShortenURLUseCase {
  execute(input: unknown): Result<ShortenedURL, ShortenedURLValidationError> {
    const parsed = shortenURLInputSchema.safeParse(input);
    if (!parsed.success) {
      const missing =
        input === null ||
        input === undefined ||
        (typeof input === "string" && input.trim().length === 0);
      return Err(
        missing
          ? { code: "required", message: "URL is required" }
          : {
              code: "invalid_url",
              message:
                "Enter a complete, valid URL starting with http:// or https://.",
            },
      );
    }

    const destination = ShortenedURL.parseDestination(parsed.data);
    if (!destination.ok) return destination;

    const shortened = ShortenedURL.create(
      generateShortCode(),
      destination.value,
    );
    if (!shortened.ok) return shortened;
    shortenedUrls.set(shortened.value.code, shortened.value.destination.value);
    return shortened;
  }
}
