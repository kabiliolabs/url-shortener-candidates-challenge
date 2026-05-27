# UI Cleanup

## Why

The current UI is intentionally poor. A small, clean UI demonstrates frontend quality without turning the challenge into a design-system exercise.

## How

Create a few presentational components and keep the visual design consistent, accessible and simple.

Components should receive data through props or route hooks. They must not import repositories, Prisma or server-only modules.

Use Radix through local reusable components. Pages and route modules should import project components, not Radix primitives directly. This keeps Radix replaceable and lets the project customize behavior or styling in one place.

Suggested component structure:

```txt
applications/web/app/components/
  ui/
    button.tsx
    text-field.tsx
    callout.tsx
  field-error.tsx
  shortened-url-result.tsx
  url-list.tsx
  url-shortener-form.tsx
```

Use Radix only where its accessible primitives add value. Simple elements can remain plain React components, but should still be exported through the project component layer.

## Checklist

- [x] Add required Radix packages.
- [x] Create a local `components/ui` layer for Radix-backed primitives.
- [x] Ensure routes/pages import project components instead of Radix primitives directly.
- [x] Document the Radix wrapper approach.
- [x] Create `Button`.
- [x] Create `TextField`.
- [x] Create `Callout` or equivalent error/status primitive.
- [x] Create `UrlShortenerForm`.
- [x] Create `ShortenedUrlResult`.
- [x] Create `UrlList`.
- [x] Create `FieldError`.
- [x] Add accessible labels, focus states and error announcements.
- [x] Replace the current intentionally ugly layout.
- [x] Add loading state during form submission.
- [x] Disable duplicate submissions while the action is pending.
- [x] Show created short URL clearly.
- [x] Add convenient copy/open behavior for shortened URLs.
- [x] Show URL list with original URL, short URL, clicks and creation date.
- [x] Keep components free of Prisma and repository imports.
