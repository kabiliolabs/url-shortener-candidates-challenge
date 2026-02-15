/**
 * TanStack Query keys for API cache.
 */
export const urlKeys = {
  all: ["urls"] as const,
  list: () => [...urlKeys.all, "list"] as const,
};
