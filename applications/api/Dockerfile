FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate
WORKDIR /app

FROM base AS dependencies
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY applications/api/package.json ./applications/api/
COPY applications/web/package.json ./applications/web/
COPY libs/engine/package.json ./libs/engine/
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/applications/api/node_modules ./applications/api/node_modules
COPY applications/api ./applications/api
COPY tsconfig.base.json ./
RUN pnpm --filter @url-shortener/api clean && pnpm --filter @url-shortener/api build

FROM base AS production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/applications/api/node_modules ./applications/api/node_modules
COPY --from=build /app/applications/api/dist ./applications/api/dist
COPY --from=build /app/applications/api/prisma ./applications/api/prisma
COPY applications/api/package.json ./applications/api/
WORKDIR /app/applications/api
EXPOSE 4000
CMD ["sh", "-c", "pnpm db:push && pnpm start"]
