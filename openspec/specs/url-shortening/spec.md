# url-shortening Specification

## Purpose

Lets a user submit a destination URL and receive back a short, unique code that can later be used to reach that destination, with input validation and creation-time abuse protection.

## Requirements

### Requirement: Accept only valid HTTP/HTTPS URLs for shortening
The system SHALL accept a submitted URL for shortening only if it uses the `http` or `https` scheme, parses as a well-formed URL, and does not exceed a maximum allowed length. Any other submission SHALL be rejected without creating an entry.

#### Scenario: Valid https URL accepted
- **WHEN** a user submits a well-formed `https://` URL
- **THEN** the system creates a shortened URL entry and returns its short code

#### Scenario: Non-http(s) scheme rejected
- **WHEN** a user submits a URL with a `javascript:`, `data:`, or `file:` scheme
- **THEN** the system rejects the submission with a field-level validation error and does not create an entry

#### Scenario: Oversized URL rejected
- **WHEN** a user submits a URL exceeding the maximum allowed length
- **THEN** the system rejects the submission with a field-level validation error and does not create an entry

#### Scenario: Malformed URL rejected
- **WHEN** a user submits a string that cannot be parsed as a URL
- **THEN** the system rejects the submission with a field-level validation error and does not create an entry

### Requirement: Generate a unique short code for every accepted URL
The system SHALL assign every accepted URL a short code that is not already assigned to a different destination URL, and SHALL never overwrite an existing code's destination as a side effect of creating a new entry.

#### Scenario: Newly generated code does not collide with an existing one
- **WHEN** a new URL is accepted for shortening
- **THEN** the system assigns it a short code that no other stored entry currently uses

#### Scenario: Code space exhaustion is surfaced, not silently overwritten
- **WHEN** the system cannot find an unused short code after exhausting its retry attempts
- **THEN** the system reports a failure to the user instead of overwriting an existing entry's destination

### Requirement: Shortened URLs persist across restarts
The system SHALL persist every accepted URL mapping such that it remains retrievable, with its statistics, after the application process restarts.

#### Scenario: Entry survives a restart
- **WHEN** a URL has been successfully shortened and the application is subsequently restarted
- **THEN** the shortened URL and its statistics are still retrievable afterward

### Requirement: Rate-limit URL creation per client
The system SHALL limit how many shortening requests a single client (identified by source IP address) may make within a rolling time window, rejecting requests beyond that limit with a rate-limit error instead of creating an entry.

#### Scenario: Requests within the limit succeed
- **WHEN** a client submits URLs at a rate within the configured limit
- **THEN** each otherwise-valid submission is accepted normally

#### Scenario: Requests exceeding the limit are rejected
- **WHEN** a client exceeds the configured creation rate limit
- **THEN** further creation attempts from that client are rejected with a rate-limit error until the window resets

### Requirement: Communicate creation outcome to the user
The system SHALL indicate a pending state while a creation request is in flight, and SHALL present either the resulting shortened URL or a failure-specific error message once the request completes.

#### Scenario: Pending state shown during submission
- **WHEN** a user submits the creation form
- **THEN** the interface indicates a request is in progress until a response is received

#### Scenario: Successful creation displays the shortened URL
- **WHEN** a creation request succeeds
- **THEN** the interface displays the resulting shortened URL to the user

#### Scenario: Failed creation displays a specific error
- **WHEN** a creation request fails validation or is rate-limited
- **THEN** the interface displays an error message specific to the failure reason, not a single generic message
