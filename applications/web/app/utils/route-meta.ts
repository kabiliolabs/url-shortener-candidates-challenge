import type { RouteMetaReturn } from "../types/route.types.js";

/**
 * Returns meta descriptors for a route (title + description).
 * Use in route files: export const meta = () => createRouteMeta("Title", "Description");
 */
export function createRouteMeta(title: string, description: string): RouteMetaReturn {
  return [
    { title },
    { name: "description", content: description },
  ];
}
