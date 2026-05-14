import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("s/:code", "routes/redirect.$code.tsx"),
  route("api/track/:code", "routes/api.track-click.$code.tsx"),
] satisfies RouteConfig;
