# 0005. Typed errors in the core, translated to HTTP at the adapter

Status: Accepted

## Context
The core must report failures without knowing about HTTP, and the web layer must turn them into meaningful responses.

## Decision
- `DomainError` subclasses represent broken model rules (`InvalidShortCodeError`, `InvalidDestinationUrlError`, `ShortCodeAlreadyExistsError`).
- `ApplicationError` subclasses represent use-case outcomes (`ShortLinkNotFoundError`, `SelfReferencingUrlError`, `ShortCodeGenerationExhaustedError`). A missing link is the result of a lookup, not a broken invariant, so it lives in `application`.
- Routes translate: `ShortLinkNotFoundError` → 404; other domain/application errors → 400 with their message; anything else is rethrown to the error boundary.

## Consequences
- The core stays framework-agnostic; another adapter (CLI, API) maps the same errors its own way.
- Error messages are user-facing today. If copy needs to differ from domain messages, map by error type in the web layer.
