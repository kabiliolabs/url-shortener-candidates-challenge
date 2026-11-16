# Spec Delta

## Purpose

Defines the HTTP error-response contract the service SHALL follow for every request that fails, so clients get a consistent, safe shape regardless of which layer raised the error.

## ADDED Requirements

### Requirement: Structured error response body
Every failed request SHALL respond with a JSON body of the form `{ "error": { "code": string, "message": string, "details"?: unknown } }`. The HTTP status code SHALL reflect the failure category.

#### Scenario: Invalid input
- **WHEN** a request fails domain validation (e.g. `InvalidUrlError`)
- **THEN** the response SHALL have status 400 and an `error.code` identifying the validation failure

#### Scenario: Resource not found
- **WHEN** a request references a short code that does not exist (`ShortUrlNotFoundError`)
- **THEN** the response SHALL have status 404 and an `error.code` of `SHORT_URL_NOT_FOUND`

#### Scenario: Conflicting state
- **WHEN** a request fails due to a conflict the server cannot resolve on its own (e.g. a uniqueness constraint)
- **THEN** the response SHALL have status 409 and an `error.code` describing the conflict

#### Scenario: Unexpected failure
- **WHEN** an error occurs that does not map to a known domain error
- **THEN** the response SHALL have status 500 and an `error.code` of `INTERNAL_ERROR`, with no exception message or implementation detail included in `error.message` or `error.details`

### Requirement: No internal details leak to clients
The error response body SHALL NOT contain stack traces, file paths, SQL text, or raw exception messages from the underlying runtime, in any environment.

#### Scenario: Server throws an unhandled exception
- **WHEN** an unhandled exception occurs while processing a request
- **THEN** the error middleware SHALL catch it and SHALL respond with the generic structured body from the "Unexpected failure" scenario, regardless of `NODE_ENV`
