# Spec Delta

## Purpose

Defines the format, randomness, and uniqueness guarantees the system SHALL uphold when generating a short code for a new shortened URL, and the explicit failure mode when uniqueness cannot be achieved.

## ADDED Requirements

### Requirement: Short code format
A generated short code SHALL be exactly 7 characters long, drawn only from the Base62 alphabet (`A-Z`, `a-z`, `0-9`).

#### Scenario: Generating a code
- **WHEN** the system generates a short code
- **THEN** the code SHALL match `^[A-Za-z0-9]{7}$`

### Requirement: Non-enumerable generation
Short codes SHALL be produced using a cryptographically secure random source, not a predictable sequence (such as an incrementing counter or a hash of the input URL), so that one issued code does not reveal or make it easier to guess another.

#### Scenario: Two codes for different URLs
- **WHEN** two different URLs are shortened in sequence
- **THEN** their short codes SHALL NOT be derived from each other or from any counter visible to a client

### Requirement: Uniqueness at creation time
The system SHALL NOT assign a short code that already maps to a different original URL.

#### Scenario: Generated code collides with an existing one
- **WHEN** a freshly generated short code already exists in storage
- **THEN** the system SHALL discard it and generate a new code, retrying up to 5 total attempts

### Requirement: Code generation failure
If the system cannot obtain a unique short code within the retry budget, it SHALL fail the request rather than overwrite an existing mapping.

#### Scenario: All retries collide
- **WHEN** 5 consecutive generated codes all collide with existing codes
- **THEN** the system SHALL fail the shorten request with a `CodeGenerationError`
- **AND** no existing URL mapping SHALL be modified or overwritten
