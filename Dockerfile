FROM node:20-alpine AS base
# Prisma's engines link against OpenSSL, which Alpine does not ship. It is needed
# both to generate the client and at runtime, so it goes in the shared stage.
RUN apk add --no-cache openssl
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
# The generated client is written inside node_modules, which the production stage
# copies from here, so it has to exist before the build.
RUN pnpm --filter @url-shortener/engine db:generate
RUN pnpm build

FROM base AS production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/applications/web/node_modules ./applications/web/node_modules
COPY --from=build /app/libs/engine/node_modules ./libs/engine/node_modules
COPY --from=build /app/applications/web/build ./applications/web/build
COPY libs/engine/src ./libs/engine/src
COPY libs/engine/prisma ./libs/engine/prisma
COPY applications/web/package.json ./applications/web/
COPY libs/engine/package.json ./libs/engine/
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

WORKDIR /app/applications/web
EXPOSE 3000
# Pending migrations are applied on start so `docker compose up` is the only step.
# Fine for a single instance; with several replicas this would be a separate job.
CMD ["sh", "-c", "pnpm --filter @url-shortener/engine db:deploy && pnpm start"]
