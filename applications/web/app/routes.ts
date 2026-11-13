import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // Página para crear enlaces cortos.
  index("routes/_index.tsx"),
  // Listado, búsqueda y estadísticas de enlaces.
  route("urls", "routes/urls.tsx"),
  // Redirección identificada por el código corto.
  route("s/:code", "routes/s.$code.tsx"),
] satisfies RouteConfig;
