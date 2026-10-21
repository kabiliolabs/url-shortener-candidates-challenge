FROM node:20-alpine AS base
# Prisma's query engine is linked against OpenSSL; without it the container
# starts and then fails on the first query (see binaryTargets in schema.prisma).
RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate
WORKDIR /app

FROM base AS dependencies
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY libs/engine/package.json ./libs/engine/
COPY applications/web/package.json ./applications/web/
# --ignore-scripts: the Prisma schema is not in this layer yet, so generation
# happens explicitly in the build stage below.
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM base AS build
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/libs/engine/node_modules ./libs/engine/node_modules
COPY --from=dependencies /app/applications/web/node_modules ./applications/web/node_modules
COPY . .
# Generate the Prisma client (into node_modules) before bundling the server.
RUN pnpm --filter web exec prisma generate
RUN pnpm build

FROM base AS production
ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/applications/web/node_modules ./applications/web/node_modules
COPY --from=build /app/libs/engine/node_modules ./libs/engine/node_modules
COPY --from=build /app/applications/web/build ./applications/web/build
# Schema + migrations are needed at runtime: `pnpm start` runs `migrate deploy`.
COPY applications/web/prisma ./applications/web/prisma
COPY applications/web/package.json ./applications/web/
COPY libs/engine/package.json ./libs/engine/
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Drop privileges: the server never needs root.
USER node

WORKDIR /app/applications/web
EXPOSE 3000

# Invoke the binaries directly instead of going through pnpm: corepack caches in
# root's home, and this stage runs as `node`, so `pnpm start` would re-download
# pnpm on every boot — i.e. the container would need network access to start.
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node_modules/.bin/react-router-serve ./build/server/index.js"]
