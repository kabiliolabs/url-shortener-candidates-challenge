FROM node:22-slim AS base
# openssl is needed by Prisma's schema engine (used for migrations)
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate
WORKDIR /app

# Install dependencies first so this layer is cached until a manifest changes.
# pnpm-workspace.yaml carries the approved build scripts and the better-sqlite3 override.
FROM base AS dependencies
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY libs/engine/package.json ./libs/engine/
COPY applications/web/package.json ./applications/web/
RUN pnpm install --frozen-lockfile

FROM dependencies AS build
COPY . .
# The Prisma client is generated code (gitignored), so it must be created here.
RUN pnpm --filter @url-shortener/engine exec prisma generate
RUN pnpm build

FROM build AS production
ENV NODE_ENV=production
ENV DATABASE_URL=file:/app/data/app.db
EXPOSE 3000
# Apply pending migrations, then start the server.
CMD ["sh", "-c", "pnpm --filter @url-shortener/engine db:deploy && pnpm --filter web start"]