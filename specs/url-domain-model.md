# URL domain model

## Goal

Introduce a small DDD domain model for URL shortening as the first step toward hexagonal architecture. Keep the existing storage approach; repository abstraction and persistence will come later.

## Scope

- Add a generic shared `URL` value object and a `ShortenedURL` aggregate root that owns the shortener's destination policy.
- Add a shared, generic `Result<T, E>` type with `Ok` and `Err` helpers.
- Validate destinations through the domain model before storing them, and translate validation failures at the server boundary.
- Cover the domain rules and server integration with automated tests.

Out of scope: repository interfaces, database/ORM integration, a full use-case/ports/adapters migration, changes to short-code generation or collision handling, statistics, timestamps, destination editing, abuse controls, and richer frontend feedback/loading states. This step does not satisfy persistence across restarts.

## Requirements

### Shared result type

Use the same contract as the supplied MurphyAI reference, implemented locally without a dependency on that project:

```ts
type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```

`Ok(value)` constructs success; `Err(error)` constructs failure. Keep this type generic and independent of URL validation, HTTP, and UI concerns.

### URL value object

- Name the class `URL`. Use `globalThis.URL` explicitly when accessing the native parser to avoid the naming conflict.
- Provide `URL.safeParse(input: string): Result<URL, URLValidationError>` as the public creation method. Prevent callers from bypassing validation through direct construction. Callers must validate the type of untrusted input before calling this method; TypeScript types do not replace runtime boundary checks.
- Return `Err` for invalid URL strings rather than throwing. Non-string values are outside this method's contract. No separate throwing factory is required.
- Hold an immutable validated string value. Trim surrounding whitespace, but preserve the remaining destination text; parsing must not silently rewrite the stored URL.
- Live in `src/shared/value-objects/url.ts`, with colocated tests. It has no dependency on the shortener module.
- Accept any absolute URL parseable by `globalThis.URL` without a base, with no protocol allowlist or universal hostname requirement. This is general URL parsing, not validation of protocol-specific addresses or destination reachability. Native parser repairs are permitted for parsing only; keep the original trimmed text as the value.
- Expose a read-only `protocol` getter using the parsed, normalized scheme including the colon, for example `https:` or `sftp:`. Do not expose a mutable native URL instance.
- Represent expected validation errors with `required` or `invalid_url` and generic messages. HTTP-specific messages and `unsupported_protocol` belong to the shortener domain.
- Treat empty/whitespace-only strings as `required`; unparseable or relative inputs produce `invalid_url`.
- Give equal trimmed destination strings value equality; do not add URL canonicalization or semantic equivalence rules.

| Input | Result |
| --- | --- |
| `https://example.com/article?ref=test#section` | Accept |
| `http://example.com` | Accept |
| `http://localhost:3000/page` | Accept |
| `http://192.168.1.10/page` or `http://[::1]:3000/page` | Accept |
| `  https://example.com/path  ` | Accept as `https://example.com/path` |
| Empty string or whitespace only | `required` |
| `example.com`, `https://`, or `https://exa mple.com` | `invalid_url` |
| `ftp://example.com`, `sftp://example.com/file`, `mailto:person@example.com`, `urn:isbn:9780141036144`, or `javascript:alert(1)` | Accept; the aggregate may reject their use as shortener destinations |
| `https:example.com` or `https:/example.com` | Accept as parseable, preserving the input text; the aggregate rejects the incomplete HTTP syntax |
| `/relative/path` or `ftp://` | `invalid_url` |

### ShortenedURL domain entity

- Represent one shortened link using its existing short code as identity and a validated `URL` as its destination.
- Expose the code and destination as read-only values; no destination-update operation is needed for this feature.
- Keep the aggregate in `src/modules/url-shortener/domain/shortened-url.ts`. It must accept only HTTP/HTTPS destinations, using the shared value object's protocol, and require explicit `http://` or `https://` syntax with an authority. Retain localhost/IP acceptance and the existing strict HTTP input behavior.
- Make construction private and expose a `create` factory returning `Result`. The factory enforces the policy even when called directly with a valid non-HTTP shared URL.
- Provide destination parsing/validation before generation so the use case can reject invalid destinations without consuming a code. `parseDestination` delegates generic parsing to `URL.safeParse`, maps generic failures to shortener messages, and preserves the existing unsupported-protocol classification even for malformed non-HTTP input. `validateDestination` checks an already parsed value; creation reuses the same policy.
- Use `ShortenedURLValidationError` for the shortener's `required`, `invalid_url`, and `unsupported_protocol` outcomes. Preserve existing public messages and HTTP error mapping.
- Keep generation, storage, HTTP responses, and environment configuration outside the entity. An aggregate-root base class is not required.
- Construct the public shortened address outside the domain using the existing `PUBLIC_URL` configuration and `/s/` path.
- Do not claim that the entity guarantees global code uniqueness. The existing generator and collision behavior are unchanged in this scope.

### Integration and error boundaries

- Keep domain classes and the shared result type in the engine, independent of React Router, React, ORM models, and server configuration.
- The application boundary must reject missing input as `required` and other non-string values as `invalid_url` before invoking domain parsing. The use case validates extracted form input through Zod without casts; shared `URL.safeParse` remains string-only.
- Validate the destination through the aggregate's parsing/policy methods before generating a code. Create the aggregate through its guarded factory, then store the code and destination string using the existing in-memory map. Routes retain request extraction and HTTP mapping.
- Rejected input must not create or overwrite a stored entry.
- Domain errors contain no HTTP status or UI field metadata. The server route maps expected validation errors to HTTP 400 with a stable error code and safe message, preserving the existing `error` message property consumed by the UI.
- The frontend controller/view remain responsible for presentation. Use the existing error rendering for this feature; client-side validation timing, field associations, loading states, and retry feedback remain separate work.
- Preserve successful response shape, result-link behavior, redirect behavior, and unknown-code 404 responses. Keep the existing required-input message, `URL is required`.

## Acceptance criteria

- `URL.safeParse` returns the expected result for every string example above without throwing for invalid URL strings. Compile-time checks reject non-string arguments; missing/non-string HTTP input is rejected at the server boundary. Successful values cannot be constructed through an unvalidated public constructor.
- The shared result helpers produce the agreed discriminated union, and callers can narrow success/failure through `ok`.
- `ShortenedURL` retains its code and validated destination without depending on transport or persistence details. Its factory rejects valid non-HTTP shared URLs and parser-repaired incomplete HTTP syntax; callers cannot bypass validation through a public constructor.
- The shared URL accepts the non-HTTP examples above and exposes immutable protocol/value data. Its error type/messages have no shortener policy, and it imports no module-specific code.
- Direct invalid submissions receive HTTP 400 with a stable code and readable error message, without changing storage. These checks must bypass native browser validation to prove server enforcement.
- A valid submission stores the trimmed destination and produces a working shortened link using the existing configuration; redirects and unknown-code responses retain their behavior.
- Add pure domain tests and action/redirect integration tests using the existing Vitest setup, with isolated in-memory state. Cover validation, value equality, error mapping, unchanged storage on rejection, and successful shortening/resolution. Make the root test command include the new domain tests.
- `pnpm test`, `pnpm typecheck`, and `pnpm build` pass. Record any unavailable verification separately; no database or full hexagonal migration is implied by completion.
