import { Data } from "effect"

export class InvalidUrlError extends Data.TaggedError("InvalidUrlError")<{
  reason: "empty" | "format" | "too_long"
}> {}

export class CodeCollisionError extends Data.TaggedError("CodeCollisionError")<{}> {}

export class LinkNotFoundError extends Data.TaggedError("LinkNotFoundError")<{
  code: string
}> {}

export class RateLimitError extends Data.TaggedError("RateLimitError")<{}> {}

export type DomainError =
  | InvalidUrlError
  | CodeCollisionError
  | LinkNotFoundError
  | RateLimitError

export function domainErrorMessage(err: DomainError): string {
  switch (err._tag) {
    case "InvalidUrlError":
      if (err.reason === "empty") return "Please enter a URL."
      if (err.reason === "too_long") return "URL is too long (max 2048 characters)."
      return "Enter a valid URL starting with http:// or https://"
    case "CodeCollisionError":
      return "Could not generate a unique short code. Please try again."
    case "LinkNotFoundError":
      return `Short link /${err.code} not found.`
    case "RateLimitError":
      return "Too many requests. Please wait a moment before trying again."
  }
}
