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
RUN DATABASE_URL="postgresql://postgres:postgres@localhost:5432/url_shortener?schema=public" pnpm --filter web exec prisma generate
RUN pnpm build

FROM base AS production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/applications/web/node_modules ./applications/web/node_modules
COPY --from=build /app/libs/engine/node_modules ./libs/engine/node_modules
COPY --from=build /app/applications/web/build ./applications/web/build
COPY --from=build /app/applications/web/prisma ./applications/web/prisma
COPY libs/engine/src ./libs/engine/src
COPY applications/web/package.json ./applications/web/
COPY libs/engine/package.json ./libs/engine/
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

WORKDIR /app/applications/web
EXPOSE 3000
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && pnpm start"]
