#!/bin/sh
set -e

# NOTE: In multi-replica deployments, migrations should be run as a separate
# init container or one-off job to avoid race conditions.
echo "Running database migrations..."
MAX_RETRIES=5
RETRY_COUNT=0
until cd /app/infra/database && pnpm exec prisma migrate deploy; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
    echo "Migration failed after $MAX_RETRIES attempts"
    exit 1
  fi
  echo "Migration attempt $RETRY_COUNT failed, retrying in 3s..."
  sleep 3
done

cd /app/applications/web
exec pnpm start
