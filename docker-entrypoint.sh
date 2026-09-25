#!/bin/sh
set -e

cd /app/libs/engine
node_modules/.bin/prisma migrate deploy

cd /app/applications/web
exec pnpm start
