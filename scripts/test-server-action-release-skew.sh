#!/usr/bin/env bash
set -euo pipefail

compose_file="docker-compose.release-skew.yml"
project_name="work-items-release-skew-test"
release_a="digicolony-client-ops:release-skew-a"
release_b="digicolony-client-ops:release-skew-b"
build_secret=""

compose() {
  WORK_ITEMS_IMAGE="${WORK_ITEMS_IMAGE:-$release_a}" docker compose \
    --project-name "$project_name" \
    --file "$compose_file" \
    "$@"
}

cleanup() {
  compose down --volumes --remove-orphans >/dev/null 2>&1 || true
  if [[ -n "$build_secret" && -f "$build_secret" ]]; then
    rm -f -- "$build_secret"
  fi
}
trap cleanup EXIT

cleanup
build_secret="$(mktemp "${TMPDIR:-/tmp}/work-items-action-key.XXXXXX")"
chmod 600 "$build_secret"
printf '%s\n' \
  'NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA=' \
  >"$build_secret"

docker build \
  --target runner \
  --secret "id=sheldon_app_env,src=$build_secret" \
  --build-arg NEXT_DEPLOYMENT_ID=release-skew-a \
  --tag "$release_a" \
  .
docker build \
  --target runner \
  --secret "id=sheldon_app_env,src=$build_secret" \
  --build-arg NEXT_DEPLOYMENT_ID=release-skew-b \
  --tag "$release_b" \
  .

compose up --detach postgres
for attempt in $(seq 1 60); do
  if compose exec --no-TTY postgres pg_isready -U appuser -d appdb >/dev/null; then
    break
  fi
  if [[ "$attempt" = "60" ]]; then
    compose logs --no-color postgres
    exit 1
  fi
  sleep 1
done

DATABASE_URL="postgresql://appuser:release-skew-test-password@127.0.0.1:55433/appdb?schema=public" \
  pnpm --filter @digicolony/db exec prisma db push \
    --schema prisma/schema.prisma \
    --skip-generate >/dev/null

DATABASE_URL="postgresql://appuser:release-skew-test-password@127.0.0.1:55433/appdb?schema=public" \
  SEED_DEFAULT_PASSWORD="ChangeMe123!" \
  pnpm --filter @digicolony/db prisma:seed >/dev/null

compose up --detach app
for attempt in $(seq 1 60); do
  if curl --fail --silent --max-time 5 \
    http://127.0.0.1:54081/api/health >/dev/null; then
    break
  fi
  if [[ "$attempt" = "60" ]]; then
    compose logs --no-color app
    exit 1
  fi
  sleep 1
done

WORK_ITEMS_REPLACEMENT_IMAGE="$release_b" \
  node scripts/test-stale-tab-release-skew.mjs

test "$(compose ps --quiet app | xargs docker inspect --format '{{.Config.Image}}')" = \
  "$release_b"

printf 'release_a=%s\n' "$release_a"
printf 'release_b=%s\n' "$release_b"
printf 'database_downgrade=not_run\n'
