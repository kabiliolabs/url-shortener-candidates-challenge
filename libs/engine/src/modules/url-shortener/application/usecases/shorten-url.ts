import { shortenURLInputSchema } from "../validations/shorten-url.validation";
import { ShortenedURL } from "../../domain/shortened-url";
import type { ShortenedURLValidationError } from "../../domain/shortened-url";
import type { ShortCodeGenerator } from "../ports/short-code-generator";
import type { ShortenerRepository } from "../ports/shortener-repository";
import { Err } from "../../../../shared/types/result";
import type { Result } from "../../../../shared/types/result";

export type ShortenURLError =
  | ShortenedURLValidationError
  | {
      code: "code_exhausted" | "storage_unavailable";
      message: string;
    };

export class ShortenURLUseCase {
  constructor(
    private readonly generator: ShortCodeGenerator,
    private readonly repository: ShortenerRepository,
  ) {}

  async execute(
    input: unknown,
  ): Promise<Result<ShortenedURL, ShortenURLError>> {
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

    for (let attempt = 0; attempt < 3; attempt++) {
      const shortened = ShortenedURL.create(
        this.generator.generate(),
        destination.value,
      );
      if (!shortened.ok) return shortened;
      const stored = await this.repository.insert(shortened.value);
      if (stored.ok) return shortened;
      if (stored.error.code !== "code_conflict") {
        return Err({
          code: "storage_unavailable",
          message: "Service temporarily unavailable. Please try again.",
        });
      }
    }
    return Err({
      code: "code_exhausted",
      message: "Could not create a short link. Please try again.",
    });
  }
}
