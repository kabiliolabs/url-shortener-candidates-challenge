import { resolveShortenedURLInputSchema } from "../validations/resolve-shortened-url.validation";
import { shortenedUrls } from "../../shortened-url";
import { Err, Ok } from "../../../../shared/types/result";
import type { Result } from "../../../../shared/types/result";

export type ResolveShortenedURLError = {
  code: "invalid_code" | "not_found";
  message: string;
};

export class ResolveShortenedURLUseCase {
  execute(input: unknown): Result<string, ResolveShortenedURLError> {
    const parsed = resolveShortenedURLInputSchema.safeParse(input);
    if (!parsed.success) {
      return Err({ code: "invalid_code", message: "Invalid short code" });
    }

    const destination = shortenedUrls.get(parsed.data);
    if (destination === undefined) {
      return Err({ code: "not_found", message: "Not Found" });
    }

    return Ok(destination);
  }
}
