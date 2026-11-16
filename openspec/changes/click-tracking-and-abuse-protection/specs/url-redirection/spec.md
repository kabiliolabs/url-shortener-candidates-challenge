# Spec Delta

## Purpose

Defines how the system resolves a short code into a redirect, including the click-tracking side effect and the behavior for unknown codes.

## ADDED Requirements

### Requirement: Redirect uses HTTP 302
Resolving an existing short code SHALL respond with an HTTP 302 redirect to the stored original URL. The system SHALL NOT use HTTP 301 for this redirect.

#### Scenario: Known code is resolved
- **WHEN** a client requests a short code that maps to a stored URL
- **THEN** the response SHALL be an HTTP 302 redirect to that URL

### Requirement: Click count incremented atomically on resolution
Each time a short code is successfully resolved, the system SHALL atomically increment that record's click count by exactly 1.

#### Scenario: Single resolution increments the count by one
- **WHEN** a short code is resolved once
- **THEN** its stored click count SHALL increase by exactly 1

#### Scenario: Concurrent resolutions are not lost
- **WHEN** the same short code is resolved by multiple concurrent requests
- **THEN** the final click count SHALL equal the number of resolutions, with no increment lost

### Requirement: Unknown code returns 404
Requesting a short code with no matching record SHALL respond with HTTP 404 and SHALL NOT modify any stored record.

#### Scenario: Code does not exist
- **WHEN** a client requests a short code that has no matching stored record
- **THEN** the response SHALL have status 404
- **AND** no click count SHALL be incremented
