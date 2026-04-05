import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("s/:code", "routes/s.$code.tsx"),
  route("stats", "routes/stats.tsx"),
] satisfies RouteConfig;
