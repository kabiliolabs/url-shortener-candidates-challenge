# url-redirection Specification

## Purpose

Lets anyone visiting a short link reach the original destination URL, and records that the link was visited so usage can be reviewed later.

## Requirements

### Requirement: Redirect a known short code to its destination
The system SHALL redirect a visitor to the destination URL previously associated with a short code, when that code exists.

#### Scenario: Known code redirects to destination
- **WHEN** a visitor requests a short code that exists
- **THEN** the system responds with an HTTP redirect to that code's stored destination URL

### Requirement: Report unknown short codes clearly
The system SHALL respond with a not-found result, and SHALL NOT redirect, when a requested short code has no associated destination.

#### Scenario: Unknown code returns not found
- **WHEN** a visitor requests a short code that does not exist
- **THEN** the system responds with a 404 not-found result and does not issue a redirect

### Requirement: Record click statistics on every successful redirect
The system SHALL increment the click count and update the last-clicked time for a short code's entry each time that code is successfully resolved to its destination, and SHALL NOT change any entry's statistics when resolution fails.

#### Scenario: Click count increments on visit
- **WHEN** a visitor successfully resolves an existing short code
- **THEN** that entry's click count increases by one and its last-clicked time is updated to the time of the visit

#### Scenario: Failed lookups do not affect statistics
- **WHEN** a visitor requests a short code that does not exist
- **THEN** no entry's click count or last-clicked time is changed
