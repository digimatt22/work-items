#!/usr/bin/env bash
set -euo pipefail

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required to start the local PostgreSQL container." >&2
  exit 1
fi

docker compose up -d postgres

echo "Waiting for PostgreSQL to become healthy..."
for _ in $(seq 1 30); do
  if docker compose exec -T postgres pg_isready -U postgres -d digicolony_client_ops >/dev/null 2>&1; then
    echo "PostgreSQL is ready."
    exit 0
  fi

  sleep 2
done

echo "PostgreSQL did not become ready in time." >&2
exit 1
