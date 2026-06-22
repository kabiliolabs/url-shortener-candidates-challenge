#!/bin/sh
set -e

# Apply versioned migrations if present, otherwise sync the schema directly.
# In this project migrations are committed, so `migrate deploy` is the path used.
if [ -d ./prisma/migrations ] && [ "$(ls -A ./prisma/migrations 2>/dev/null)" ]; then
  echo "Running prisma migrate deploy…"
  pnpm exec prisma migrate deploy
else
  echo "No migrations found; running prisma db push…"
  pnpm exec prisma db push --skip-generate
fi

exec pnpm start
