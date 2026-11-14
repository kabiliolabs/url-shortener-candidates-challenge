# UI restyling

## Goal

Restyle the existing application to make it cleaner and easier to use without changing its current behavior or functionality.

## Scope

### What should change

- Update the CSS for a consistent, readable appearance.
- Style both light and dark modes, following the existing system color preference.
- Remove decorative characters such as `~*~` and `★` from existing text.
- Remove rotation and skew so boxes and controls appear straight.
- Update class names in existing components as needed to apply the styles.

### What should not change

- Application behavior or functionality, including form submission, validation, shortening, redirects, and error handling.
- Existing navigation and link behavior.
- Components: do not add new components or controls.
- Existing wording, except for removing decorative characters.

## Requirements

Use the same off-white, dark green, and lime colors in both modes, adjusting their roles:

| Use | Light mode | Dark mode |
| --- | --- | --- |
| Background | `#f7f8f3` | `#182118` |
| Text | `#182118` | `#f7f8f3` |
| Main button background | `#182118` | `#c6f432` |
| Main button text | `#c6f432` | `#182118` |

Apply the mode through CSS using the system color preference, including native form controls. No theme toggle is added.

Define presentation styles in `applications/web/app/app.css` and reference them through named classes in existing components. Remove the old styling utilities they replace, including hover and focus styles.

Use consistent spacing, readable text, and visible keyboard focus. Keep the layout usable on mobile and desktop.

## Acceptance criteria

- The existing views use the palette for the active mode: lime text on dark green main buttons in light mode, and dark green text on lime main buttons in dark mode.
- Switch the system between light and dark mode and verify that backgrounds, text, buttons, and native form controls follow the selected mode.
- Decorative characters are removed, and boxes and controls are no longer rotated or skewed.
- Existing functionality and navigation work as before, with no new components or controls.
- Check the home page, successful result, inline form error, and full error page on mobile and desktop in both themes, including long displayed links and visible keyboard focus.
- Long displayed URLs wrap without horizontal page scrolling. Single-line inputs and error stack traces may scroll within their own boundaries.
- Verify shortening, redirects, and existing error states; run `pnpm typecheck` and `pnpm build` after implementation.
