import { atom } from "jotai";

/**
 * Shorten-form state. Use these atoms in components that need the state;
 * do not pass the same state as props from a parent.
 */

/** URL input value in the shorten form. */
export const shortenFormUrlAtom = atom<string>("");

/** Whether the shorten request is in progress. */
export const shortenFormLoadingAtom = atom<boolean>(false);

/** Shorten API error message to show in the form (null when no error). */
export const shortenFormErrorAtom = atom<string | null>(null);

/** Copy-to-clipboard error message to show in the form (null when no error). */
export const shortenFormCopyErrorAtom = atom<string | null>(null);

/** Last successfully shortened URL (set on success; used for result display and elsewhere). */
export const lastShortenedUrlAtom = atom<string | null>(null);
