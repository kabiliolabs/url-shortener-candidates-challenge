#!/bin/sh
set -e

host="$1"
port="${2:-6379}"
shift 2
cmd="$@"

echo "Waiting for Redis at $host:$port..."

max_attempts=60
attempt=1

while [ $attempt -le $max_attempts ]; do
  if nc -z -w 2 "$host" "$port" >/dev/null 2>&1; then
    echo "Redis connection successful — starting application!"
    exec $cmd
  fi

  echo "Attempt $attempt/$max_attempts: Redis not ready yet — sleeping 1s..."
  sleep 1
  attempt=$((attempt + 1))
done

echo "ERROR: Redis did not become available after $max_attempts attempts"
exit 1