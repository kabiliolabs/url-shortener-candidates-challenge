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
# Prisma client is referenced by engine source — must generate before TS build.
RUN pnpm --filter @url-shortener/engine exec prisma generate
RUN pnpm build

FROM base AS production
ENV NODE_ENV=production
# Make the workdir owned by the unprivileged `node` user so pnpm/prisma can
# write any incidental files (e.g. caches in $HOME, prisma engine binaries).
RUN chown -R node:node /app
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/applications/web/node_modules ./applications/web/node_modules
COPY --chown=node:node --from=build /app/libs/engine/node_modules ./libs/engine/node_modules
COPY --chown=node:node --from=build /app/applications/web/build ./applications/web/build
COPY --chown=node:node libs/engine/src ./libs/engine/src
COPY --chown=node:node libs/engine/prisma ./libs/engine/prisma
COPY --chown=node:node applications/web/public ./applications/web/public
# Prisma 7 emits its client to a custom path inside src/ (so tsc rootDir is
# happy). Copy the generated output from the build stage so the runtime can
# resolve `src/generated/prisma/client`.
COPY --chown=node:node --from=build /app/libs/engine/src/generated ./libs/engine/src/generated
COPY --chown=node:node libs/engine/prisma.config.ts ./libs/engine/
COPY --chown=node:node applications/web/package.json ./applications/web/
COPY --chown=node:node libs/engine/package.json ./libs/engine/
COPY --chown=node:node package.json pnpm-workspace.yaml pnpm-lock.yaml ./

USER node
EXPOSE 3000
# Migrations now run in a dedicated one-shot compose service; web only serves
# traffic. `exec node` makes the JS runtime PID 1 so SIGTERM reaches our
# graceful-shutdown hook (engine.dispose) instead of being trapped by sh.
CMD ["sh", "-c", "cd /app/applications/web && exec node node_modules/@react-router/serve/bin.js build/server/index.js"]
