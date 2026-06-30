/**
 * Join conditional class names into a single string, dropping falsy values.
 * Intentionally dependency-free — the project only needs simple concatenation,
 * not Tailwind class-conflict resolution.
 */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}
