#!/bin/sh
set -e

cd /app/libs/engine
pnpm exec prisma migrate deploy

cd /app/applications/web
exec "$@"
