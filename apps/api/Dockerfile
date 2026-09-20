FROM node:24-alpine AS build
WORKDIR /workspace
RUN corepack enable
COPY . .
RUN corepack install
RUN pnpm install --frozen-lockfile
RUN pnpm --filter api exec prisma generate
RUN pnpm --filter api build
RUN pnpm --filter api deploy --prod --legacy /app
RUN cd /app && ./node_modules/.pnpm/node_modules/.bin/prisma generate

FROM node:24-alpine AS runtime
WORKDIR /app
COPY --from=build /app ./
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/server.js"]
