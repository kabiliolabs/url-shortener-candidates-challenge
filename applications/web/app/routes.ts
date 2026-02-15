import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("s/:code", "routes/s.$code.tsx"),
  route("api/shorten", "routes/api.shorten.ts"),
  route("api/urls", "routes/api.urls.ts"),
  route("urls", "routes/urls._index.tsx"),
] satisfies RouteConfig;
