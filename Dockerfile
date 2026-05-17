FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate
WORKDIR /app

FROM base AS dependencies
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY libs/engine/package.json ./libs/engine/
COPY applications/web/package.json ./applications/web/
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/libs/engine/node_modules ./libs/engine/node_modules
COPY --from=dependencies /app/applications/web/node_modules ./applications/web/node_modules
COPY . .
RUN cd applications/web && pnpm prisma generate
RUN pnpm build

FROM base AS production
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY libs/engine/package.json ./libs/engine/
COPY applications/web/package.json ./applications/web/
RUN pnpm install --frozen-lockfile --prod

COPY --from=build /app/applications/web/build ./applications/web/build
COPY --from=build /app/applications/web/generated ./applications/web/generated
COPY --from=build /app/applications/web/prisma ./applications/web/prisma
COPY --from=build /app/applications/web/prisma.config.ts ./applications/web/prisma.config.ts

RUN mkdir -p /app/applications/web/data

WORKDIR /app/applications/web
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1
CMD sh -c "pnpm prisma migrate deploy && pnpm start"
