# 0009. Default https scheme added in the web adapter

Status: Accepted

## Context
`DestinationUrl` requires an absolute http/https URL, and the form used `type="url"`. Non-technical users type `www.example.com` or `example.com` and got rejected, even though browsers accept that in the address bar.

## Decision
- The index route action prepends `https://` when the input has no scheme, before calling the use case.
- An explicit scheme is kept as typed: `http://` stays http, and `ftp:` or `javascript:` still reach the domain and are rejected there.
- The form input is `type="text"` with `inputMode="url"`, so the browser does not block scheme-less input and mobile keyboards stay URL-friendly.
- The domain rule is unchanged: guessing what the user meant is a UI concern, not a model rule.
- Normalization runs on the server, so it also covers submissions without JavaScript.

## Consequences
- A site that only serves plain HTTP, typed without a scheme, gets an https link that fails to connect. Users can type `http://` explicitly; defaulting to http would downgrade the common case to an insecure connection.
- The web app now has its own Vitest setup for adapter-level unit tests.
