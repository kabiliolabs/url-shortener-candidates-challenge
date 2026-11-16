# Spec Delta

## Purpose

Defines the validation rules a submitted URL must satisfy before being shortened, and the request-level protections that guard the service from abuse.

## ADDED Requirements

### Requirement: Only http/https URLs accepted
A submitted URL SHALL be rejected unless its scheme is `http` or `https`.

#### Scenario: javascript scheme rejected
- **WHEN** a client submits a URL with the `javascript:` scheme
- **THEN** the system SHALL reject it with a 400 validation error

#### Scenario: Non-http scheme rejected
- **WHEN** a client submits a URL with a scheme other than `http` or `https` (e.g. `ftp:`)
- **THEN** the system SHALL reject it with a 400 validation error

### Requirement: Maximum URL length enforced
A submitted URL SHALL be rejected if it exceeds 2048 characters.

#### Scenario: URL too long
- **WHEN** a client submits a URL longer than 2048 characters
- **THEN** the system SHALL reject it with a 400 validation error

### Requirement: Valid hostname required
A submitted URL SHALL be rejected if it does not have a syntactically valid hostname.

#### Scenario: Malformed URL
- **WHEN** a client submits a string that is not a well-formed URL with a hostname
- **THEN** the system SHALL reject it with a 400 validation error

### Requirement: Self-domain URLs rejected
A submitted URL SHALL be rejected if its host matches this service's own configured domain, to prevent a short URL that redirects back into the shortener.

#### Scenario: URL points back at the shortener
- **WHEN** a client submits a URL whose host is the shortener's own domain
- **THEN** the system SHALL reject it with a 400 validation error

### Requirement: Rate limiting on URL creation
The system SHALL limit how many shorten requests a client can make within a time window. Once exceeded, further requests SHALL be rejected until the window resets.

#### Scenario: Client exceeds the rate limit
- **WHEN** a client exceeds the configured request rate for creating shortened URLs
- **THEN** the system SHALL respond with HTTP 429, a `Retry-After` header, and a message indicating when to retry

### Requirement: Cross-origin requests restricted
The system SHALL only grant cross-origin access to the configured frontend origin.

#### Scenario: Request from an allowed origin
- **WHEN** a cross-origin request arrives from the configured frontend origin
- **THEN** the response SHALL include CORS headers permitting it

#### Scenario: Request from a disallowed origin
- **WHEN** a cross-origin request arrives from an origin other than the configured frontend origin
- **THEN** the response SHALL NOT include CORS headers permitting it

### Requirement: Request body size limit enforced
The system SHALL reject a request whose body exceeds a configured maximum size, rather than processing an unbounded payload.

#### Scenario: Oversized request body
- **WHEN** a client sends a request body larger than the configured maximum size
- **THEN** the system SHALL reject it without processing its contents
