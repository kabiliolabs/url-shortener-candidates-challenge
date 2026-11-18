#!/bin/sh
set -e

cd /app
pnpm --filter @url-shortener/engine exec prisma migrate deploy

cd /app/applications/web
exec pnpm start
