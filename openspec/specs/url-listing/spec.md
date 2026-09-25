# url-listing Specification

## Purpose

Lets a user see every shortened URL that has been created, together with its usage statistics, so they can review what has been shared and how much it has been used.

## Requirements

### Requirement: List all shortened URLs with their statistics
The system SHALL display every shortened URL entry together with its short code, destination URL, click count, last-clicked time (if any), and creation time.

#### Scenario: Newly created entry appears in the list
- **WHEN** a new URL has been successfully shortened
- **THEN** it appears in the listing with a click count of zero and no last-clicked time

#### Scenario: Listing reflects recorded clicks
- **WHEN** a shortened URL has been visited one or more times
- **THEN** its entry in the listing shows the updated click count and last-clicked time
