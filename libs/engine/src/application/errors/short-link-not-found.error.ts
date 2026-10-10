import type { ShortCode } from "../../domain";
import { ApplicationError } from "./application-error";

export class ShortLinkNotFoundError extends ApplicationError {
  constructor(readonly code: ShortCode) {
    super(`Short link "${code.value}" was not found`);
  }
}
