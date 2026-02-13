FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate
WORKDIR /app

FROM base AS dependencies
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY libs/engine/package.json ./libs/engine/
COPY libs/db/package.json ./libs/db/
COPY applications/web/package.json ./applications/web/
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/libs/engine/node_modules ./libs/engine/node_modules
COPY --from=dependencies /app/libs/db/node_modules ./libs/db/node_modules
COPY --from=dependencies /app/applications/web/node_modules ./applications/web/node_modules
COPY . .
# Generate Prisma client
RUN cd libs/db && pnpm prisma generate
# Build all packages
RUN pnpm build

FROM base AS production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/applications/web/node_modules ./applications/web/node_modules
COPY --from=build /app/libs/engine/node_modules ./libs/engine/node_modules
COPY --from=build /app/libs/db/node_modules ./libs/db/node_modules
COPY --from=build /app/applications/web/build ./applications/web/build
COPY libs/engine/src ./libs/engine/src
COPY libs/db/src ./libs/db/src
COPY libs/db/prisma ./libs/db/prisma
COPY applications/web/package.json ./applications/web/
COPY libs/engine/package.json ./libs/engine/
COPY libs/db/package.json ./libs/db/
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

WORKDIR /app/applications/web
EXPOSE 3000
CMD ["pnpm", "start"]
