# Design

## Context

`libs/engine` is currently 3 files (`base-url.ts`, `shortened-url.ts`, `index.ts`) with no internal structure. The only consumer is `applications/web`, which is a React Router v7 app using file-based loaders/actions (not an Express server) - there is no framework-level HTTP middleware chain to hook into. See `proposal.md` for why this is being restructured now.

## Goals / Non-Goals

**Goals:**
- Establish domain / application / infrastructure boundaries that changes 2-5 can extend without touching route files again.
- Centralize the domain-error-to-HTTP mapping in one function so every route produces the same error shape.
- Prove the refactor is behavior-preserving via characterization tests.

**Non-Goals:**
- Splitting `libs/engine` into multiple pnpm packages (one per layer).
- A DI container or framework.
- Changing the current code-generation or storage behavior (handled by later changes).

## Decisions

**Single package, folder-level layering.** Keep everything inside `libs/engine`, organized as `src/domain/`, `src/application/`, `src/infrastructure/`, with a `src/composition-root.ts` at the top. Alternative considered: one pnpm package per layer (`@url-shortener/domain`, `@url-shortener/application`, ...). Rejected: with a single consumer app and a 2-hour budget, package-per-layer adds workspace/build ceremony without a real isolation benefit; folder boundaries plus `src/domain` having zero imports from `application`/`infrastructure` (enforced by code review / a lint rule if time allows) give the same guarantee cheaply.

**Constructor injection + one composition root function.** `createShortenerApp()` in `composition-root.ts` instantiates the concrete infrastructure (for now: `InMemoryUrlRepository`, the existing `generateShortCode` wrapped as a `CodeGenerator`) and injects them into the three use cases via their constructors, returning the wired use-case instances for routes to call. Alternative considered: a DI framework (e.g. InversifyJS). Rejected: 3 use cases and 2 interfaces do not justify a container; a single factory function is simpler to read and test.

**Error mapping as a shared function, not framework middleware.** React Router v7's server middleware is still an unstable/experimental API; relying on it for a 2-hour refactor risks churn if its shape changes. Instead, add one function `toErrorResponse(error: unknown): Response` in the infrastructure layer that every route's action/loader calls from its `catch` block. It is "centralized" in the sense that the mapping table (domain error -> status + code) lives in exactly one place; call sites are per-route but trivial (`catch (e) { return toErrorResponse(e); }`). Alternative considered: adopt `unstable_middleware`. Rejected for now given its stability status; revisit if React Router promotes it to stable.

**Characterization tests before refactor.** Write tests against the current `POST /` and `GET /s/:code` behavior (using the existing in-memory map and 9-code generator, bugs included) before moving any code, then keep them green (adjusted only for the new error body shape) after the refactor. This is the safety net that proves "no behavior changed."

## Risks / Trade-offs

- [Per-route `catch` blocks could drift if someone forgets to call `toErrorResponse`] -> Mitigation: keep route handlers minimal (use case call + one catch block) and cover both routes with an integration test asserting the structured error body on a forced failure.
- [Folder-level layering has no compiler-enforced boundary, unlike separate packages] -> Mitigation: acceptable for a 2-hour, single-consumer project; revisit if the codebase grows a second consumer.
- [Wrapping the known-buggy `generateShortCode`/in-memory map behind interfaces could look like "approving" them] -> Mitigation: proposal.md explicitly scopes fixing them to later changes; this change's tests intentionally still assert the current (buggy) behavior.

## Migration Plan

No data migration - storage stays in-memory in this change. Deploy is a single code replacement (no schema, no feature flag needed); rollback is a plain revert since no persisted state format changes.
