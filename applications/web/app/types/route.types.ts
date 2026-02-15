/**
 * Types for route exports (e.g. meta). Shared by route-meta util and route files.
 */

export interface RouteMetaDescriptor {
  title?: string;
  name?: string;
  content?: string;
}

export type RouteMetaReturn = RouteMetaDescriptor[];
