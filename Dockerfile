# ─────────────────────────────────────────────────────────────
# STAGE 1: Base with Node + pnpm
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS base

RUN corepack enable && corepack prepare pnpm@10.0.0 --activate

WORKDIR /app


# ─────────────────────────────────────────────────────────────
# STAGE 2: Dependencies (full cache for build)
# ─────────────────────────────────────────────────────────────
FROM base AS deps

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY libs/engine/package.json ./libs/engine/
COPY applications/web/package.json ./applications/web/

# Install everything (dev + prod) → needed for build + workspace resolution
RUN pnpm install --frozen-lockfile --prefer-offline


# ─────────────────────────────────────────────────────────────
# STAGE 3: Build
# ─────────────────────────────────────────────────────────────
FROM base AS build

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm build --filter=web


# ─────────────────────────────────────────────────────────────
# STAGE 4: Production (FINAL IMAGE)
# ─────────────────────────────────────────────────────────────
FROM base AS production

ENV NODE_ENV=production

# Tools for healthcheck + wait
RUN apk add --no-cache curl netcat-openbsd

# ── Copy built web app
COPY --from=build /app/applications/web/build           ./applications/web/build
COPY --from=build /app/applications/web/package.json    ./applications/web/package.json

# ── Copy engine source
COPY --from=build /app/libs/engine                      ./libs/engine
COPY --from=build /app/libs/engine/package.json         ./libs/engine/package.json

# ── Copy workspace files
COPY --from=build /app/package.json                     ./package.json
COPY --from=build /app/pnpm-workspace.yaml              ./pnpm-workspace.yaml
COPY --from=build /app/pnpm-lock.yaml                   ./pnpm-lock.yaml

# ── Install FULL dependencies (including dev) → safest for workspaces
RUN pnpm install --frozen-lockfile --prefer-offline

# (We do NOT run pnpm prune --prod → prevents breaking workspace links)

# ── Wait script
COPY wait-for-redis.sh /usr/local/bin/wait-for-redis.sh
RUN chmod +x /usr/local/bin/wait-for-redis.sh

WORKDIR /app/applications/web

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=5 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["/usr/local/bin/wait-for-redis.sh", "redis", "6379", "pnpm", "start"]