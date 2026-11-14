import { resolveShortenedURLInputSchema } from "../validations/resolve-shortened-url.validation";
import type { ShortenerRepository } from "../ports/shortener-repository";
import { Err, Ok } from "../../../../shared/types/result";
import type { Result } from "../../../../shared/types/result";

export type ResolveShortenedURLError = {
  code: "invalid_code" | "not_found" | "storage_unavailable";
  message: string;
};

export class ResolveShortenedURLUseCase {
  constructor(private readonly repository: ShortenerRepository) {}

  async execute(
    input: unknown,
  ): Promise<Result<string, ResolveShortenedURLError>> {
    const parsed = resolveShortenedURLInputSchema.safeParse(input);
    if (!parsed.success) {
      return Err({ code: "invalid_code", message: "Invalid short code" });
    }

    const found = await this.repository.findByCode(parsed.data);
    if (!found.ok) {
      return Err({
        code: "storage_unavailable",
        message: "Service temporarily unavailable. Please try again.",
      });
    }
    if (found.value === null) {
      return Err({ code: "not_found", message: "Not Found" });
    }

    return Ok(found.value.destination.value);
  }
}
