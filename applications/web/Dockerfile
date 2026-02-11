FROM node:20-alpine

WORKDIR /app
RUN corepack enable

COPY . .

RUN pnpm install --frozen-lockfile

RUN pnpm exec prisma generate --schema ./applications/web/prisma/schema.prisma --config ./applications/web/prisma.config.ts

RUN pnpm --filter web build

EXPOSE 5173

CMD sh -c "pnpm exec prisma migrate deploy --schema ./applications/web/prisma/schema.prisma --config ./applications/web/prisma.config.ts && pnpm --filter web start"

