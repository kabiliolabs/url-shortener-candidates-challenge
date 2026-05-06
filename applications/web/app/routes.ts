import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
  index("routes/home.tsx"),
  route("go/:code", "routes/go.$code.tsx"),
  route("links", "routes/links.tsx"),
] satisfies RouteConfig
