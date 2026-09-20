FROM node:24-alpine AS build
WORKDIR /workspace
RUN corepack enable
COPY . .
RUN corepack install
RUN pnpm install --frozen-lockfile
RUN pnpm --filter web build

FROM nginx:1.29-alpine AS runtime
COPY --from=build /workspace/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80