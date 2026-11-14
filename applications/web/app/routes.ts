import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home/route.tsx"),
  route("s/:code", "routes/redirect/route.tsx"),
] satisfies RouteConfig;
