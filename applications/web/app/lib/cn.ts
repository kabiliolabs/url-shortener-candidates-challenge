import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names, resolving Tailwind conflicts in favour of the last one.
 *
 * `twMerge` is the part that matters: a plain join would let
 * `<Button className="bg-red-500">` emit two `bg-*` classes and leave the winner
 * up to CSS source order rather than to the caller.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
