/** Tiny class-name joiner. Avoids pulling in clsx/tailwind-merge for this scope. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
