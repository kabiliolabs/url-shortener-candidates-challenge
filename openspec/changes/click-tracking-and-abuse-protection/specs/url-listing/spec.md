# Spec Delta

## Purpose

Defines the contract for retrieving the set of shortened URLs together with their click statistics.

## ADDED Requirements

### Requirement: Listing returns URLs with statistics
The system SHALL provide a way to retrieve shortened URLs including, for each, its code, original URL, click count, and creation date.

#### Scenario: Listing with existing data
- **WHEN** a client requests the list of shortened URLs and at least one exists
- **THEN** the response SHALL include each URL's code, original URL, click count, and creation date

#### Scenario: Listing with no data
- **WHEN** a client requests the list of shortened URLs and none exist
- **THEN** the response SHALL be an empty list, not an error

### Requirement: Listing is bounded
The system SHALL limit the number of records returned in a single response, never returning an unbounded full result set.

#### Scenario: More records exist than the page size
- **WHEN** more shortened URLs exist than the configured page/limit size
- **THEN** the response SHALL return at most that many records, with a way for the client to retrieve the rest
