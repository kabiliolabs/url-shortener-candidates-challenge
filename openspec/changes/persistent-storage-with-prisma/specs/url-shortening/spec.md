# Spec Delta

## Purpose

Defines the durable record created when a URL is shortened, and the guarantee that this data outlives application and container restarts.

## ADDED Requirements

### Requirement: Persisted short URL record
WHEN a URL is successfully shortened, the system SHALL persist a record containing the generated code, the original URL, a click count initialized to 0, and a creation timestamp.

#### Scenario: Shortening a URL creates a record
- **WHEN** a client submits a valid URL to be shortened
- **THEN** the system SHALL store a record with that code, the original URL, `clicks = 0`, and the current time as `createdAt`

### Requirement: Durability across restarts
Previously shortened URLs SHALL remain resolvable after the application process or its container restarts.

#### Scenario: Restarting the service
- **WHEN** the application or its container restarts after a URL has been shortened
- **THEN** a request to resolve that URL's short code SHALL still succeed with the original URL

### Requirement: Storage-enforced code uniqueness
The storage layer SHALL reject an attempt to persist a second record with a code that already exists.

#### Scenario: Duplicate code rejected at the storage layer
- **WHEN** the system attempts to persist a record whose code already exists in storage
- **THEN** the storage layer SHALL reject the write rather than overwrite the existing record
