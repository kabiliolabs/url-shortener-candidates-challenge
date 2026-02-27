#!/bin/sh
set -e

# Ensure the database directory exists
mkdir -p /app/libs/engine/prisma

# Initialize the database schema
cd /app/libs/engine
echo "Initializing database schema..."
pnpm exec prisma db push --accept-data-loss

# Start the application
cd /app/applications/web
exec pnpm start
