# Spec Delta

## Purpose

Defines the `GET /health` endpoint contract used to report whether the service and its database dependency are operational.

## ADDED Requirements

### Requirement: Healthy status when the database is reachable
WHEN the database is reachable, `GET /health` SHALL respond with HTTP 200 and a body indicating a healthy status.

#### Scenario: Database reachable
- **WHEN** a client sends `GET /health` while the database connection is healthy
- **THEN** the response SHALL have status 200 and indicate the service is healthy

### Requirement: Unhealthy status when the database is unreachable
WHEN the database is not reachable, `GET /health` SHALL respond with HTTP 503 and a body indicating an unhealthy status, without the request hanging or crashing the process.

#### Scenario: Database unreachable
- **WHEN** a client sends `GET /health` while the database connection fails
- **THEN** the response SHALL have status 503 and indicate the service is unhealthy
