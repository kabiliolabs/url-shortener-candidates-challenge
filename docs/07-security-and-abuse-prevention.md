# Security And Abuse Prevention

## Why

The challenge asks for measures to prevent abuse. The goal is not to build a full security platform, but to address the obvious risks of a public URL shortener.

## How

Add lightweight protections close to the input and redirect boundaries. Keep them simple, explicit and documented.

Security rules may be enforced in the engine when they are domain rules, or in `applications/web` when they depend on HTTP/runtime context.

## Checklist

- [x] Reject non-HTTP(S) URLs.
- [x] Reject malformed URLs with user-friendly errors.
- [x] Reject unsupported ASCII control characters in original URLs.
- [x] Reject URLs that point back to existing short URL routes when possible.
- [x] Add a maximum original URL length.
- [x] Generate non-guessable short codes with enough entropy.
- [x] Ensure code collisions are handled safely.
- [x] Consider basic per-IP rate limiting for URL creation.
- [x] Avoid exposing stack traces or internal errors in production responses.
- [x] Document which abuse-prevention measures were implemented.
