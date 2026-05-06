import { atomWithStorage } from "jotai/utils"

/** "light" | "dark" | "system" — persisted in localStorage */
export const themeAtom = atomWithStorage<"light" | "dark" | "system">(
  "theme",
  "system",
)
