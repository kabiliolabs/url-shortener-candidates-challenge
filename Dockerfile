FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate
WORKDIR /app

FROM base AS dependencies
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY infra/database/package.json ./infra/database/
COPY applications/web/package.json ./applications/web/
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/infra/database/node_modules ./infra/database/node_modules
COPY --from=dependencies /app/applications/web/node_modules ./applications/web/node_modules
COPY . .
RUN pnpm build

FROM base AS production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/applications/web/node_modules ./applications/web/node_modules
COPY --from=build /app/infra/database/node_modules ./infra/database/node_modules
COPY --from=build /app/applications/web/build ./applications/web/build
COPY --from=build /app/infra/database/prisma ./infra/database/prisma
COPY infra/database/prisma.config.ts ./infra/database/
COPY infra/database/src ./infra/database/src
COPY applications/web/package.json ./applications/web/
COPY infra/database/package.json ./infra/database/
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
    && chown -R appuser:appgroup /app
USER appuser

WORKDIR /app/applications/web
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
