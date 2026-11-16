# Design

## Context

`libs/engine/src/shortened-url.ts` currently generates a 2-character code from a 3-character alphabet (9 total codes) with no collision check. `refactor-backend-architecture` introduces the `CodeGenerator` interface and an `InMemoryUrlRepository`; this change replaces the generator implementation and adds retry logic in the `shortenUrl` use case. See `proposal.md` for motivation and `specs/short-code-generation/spec.md` for the resulting contract.

## Goals / Non-Goals

**Goals:**
- Make collisions practically negligible and recoverable when they do happen.
- Keep codes non-enumerable (knowing one short URL must not help guess another).
- Keep the generator stateless and requiring no coordination between instances.

**Non-Goals:**
- Guaranteeing uniqueness without a storage-level check (that still requires the repository/DB, delivered in `persistent-storage-with-prisma`).
- Shortening the code length below 7 characters or changing the alphabet later (out of scope; revisit only if link length becomes a real constraint).

## Decisions

**Random Base62, 7 characters, checked against storage with bounded retry.** Three approaches were considered:

| Approach | How it works | Enumerable? | Needs coordination? | Collision handling |
|---|---|---|---|---|
| Counter + Base62 | Increment a counter, encode it in Base62 | Yes - codes are sequential, trivial to guess the next/previous one | Yes - a single counter must be consistent across all instances (a DB sequence or similar) | None needed (monotonic, never repeats) |
| Hash of input URL | e.g. first 7 chars of a hash (MD5/SHA) of the original URL | No, but deterministic: the same URL always yields the same code, and different URLs can hash to the same prefix | No | Must still detect and handle collisions (two different URLs hashing to the same prefix) |
| Cryptographically random | Pick 7 random Base62 characters per code | No - no relationship between codes | No - every instance generates independently | Must detect and retry, but collision probability is negligible (62^7 ≈ 3.5 * 10^12 space) |

**Chosen: cryptographically random.** Rejected counter+Base62 because sequential codes are enumerable (a user can walk `/s/aaaaaaa`, `/s/aaaaaab`, ...) and because a shared counter reintroduces exactly the kind of cross-instance coordination state this project doesn't want to build for a 2-hour challenge. Rejected hashing the input URL because it is still enumerable in practice (predictable relationship to a known input) and provides no benefit over random here - it would only matter if deduplicating identical URLs to the same code were a requirement, which it isn't (two users shortening the same URL should get independent codes/stats). Random avoids coordination entirely and only needs a cheap existence check plus bounded retry (5 attempts), which is already required for the hash approach anyway.

**Retry budget of 5.** At 7 random Base62 characters, the chance of any single collision is ~1 in 3.5 trillion; 5 retries is generous headroom against that, chosen to keep `CodeGenerationError` reserved for a genuinely broken system (e.g. the repository itself is failing) rather than something a real collision would ever trigger in practice.

## Risks / Trade-offs

- [`Math.random()` is not cryptographically secure and was the original implementation's weakness] -> Mitigation: use Node's `crypto.randomInt`/`crypto.getRandomValues`, not `Math.random()`.
- [Retry loop adds a repository round-trip per attempt] -> Mitigation: negligible in practice since collisions are astronomically rare; the loop only costs anything on the vanishingly unlikely collision path.
