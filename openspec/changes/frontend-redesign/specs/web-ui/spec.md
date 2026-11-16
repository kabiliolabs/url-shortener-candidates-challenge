# Spec Delta

## Purpose

Defines the observable UI behavior the shorten form and URL list SHALL provide: validation feedback, loading state, copy confirmation, list states, and accessibility.

## ADDED Requirements

### Requirement: Inline validation feedback
WHEN the user submits a URL that fails validation, the system SHALL display an inline error message next to the field without navigating away or discarding the entered value.

#### Scenario: Invalid URL submitted
- **WHEN** the user submits a value that fails URL validation
- **THEN** the system SHALL show an inline error message for that field
- **AND** the entered value SHALL remain in the field

### Requirement: Loading state during submission
WHEN the user submits the shorten form, the system SHALL disable the submit control and display a loading indicator for the duration of the request.

#### Scenario: Request in flight
- **WHEN** a shorten request has been submitted and is still pending
- **THEN** the submit control SHALL be disabled and a loading indicator SHALL be visible

### Requirement: Copyable shortened result
WHEN a URL is successfully shortened, the system SHALL display the resulting short URL together with a control to copy it to the clipboard, and SHALL show visible confirmation once the copy succeeds.

#### Scenario: Successful shorten
- **WHEN** the shorten request succeeds
- **THEN** the system SHALL display the short URL and a copy-to-clipboard control

#### Scenario: Copy confirmed
- **WHEN** the user activates the copy-to-clipboard control
- **THEN** the system SHALL show a visible confirmation that the value was copied

### Requirement: URL list reflects loading, empty, and error states
WHEN the URL list is loading, has no data, or failed to load, the system SHALL display a state corresponding to that condition instead of a blank or broken view.

#### Scenario: List is loading
- **WHEN** the URL list data has been requested but not yet received
- **THEN** the system SHALL display a loading state

#### Scenario: List has no data
- **WHEN** the URL list request succeeds with zero URLs
- **THEN** the system SHALL display an empty state, not an error

#### Scenario: List failed to load
- **WHEN** the URL list request fails
- **THEN** the system SHALL display an error state describing that the list could not be loaded

### Requirement: Backend errors shown as readable messages
WHEN a request to the backend fails, the system SHALL display a message appropriate to the failure (validation error, rate limit, network failure, or unexpected error) instead of a raw error code or stack trace.

#### Scenario: Rate limited
- **WHEN** the shorten request fails with a 429 response
- **THEN** the system SHALL display a message indicating the user should retry later

#### Scenario: Network failure
- **WHEN** a request fails due to a network error rather than a server response
- **THEN** the system SHALL display a message indicating a connectivity problem, not a raw exception

### Requirement: Accessible form and feedback
Form fields SHALL have associated labels, interactive elements SHALL have a visible focus state, and validation/result/error state changes SHALL be announced through an `aria-live` region.

#### Scenario: Keyboard navigation
- **WHEN** a user navigates the form using the keyboard
- **THEN** each interactive element SHALL show a visible focus indicator

#### Scenario: State change announced
- **WHEN** a validation error, a successful result, or a request error appears
- **THEN** the change SHALL be announced through an `aria-live` region for assistive technology
