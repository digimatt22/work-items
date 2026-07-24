#!/usr/bin/env bash
set -euo pipefail

compose_file="docker-compose.readiness.yml"
project_name="work-items-readiness-test"
app_image="${WORK_ITEMS_IMAGE:-digicolony-client-ops:sheldon-0.2-candidate}"
own_bucket="work-items-readiness-test"
foreign_bucket="other-application-readiness-test"
access_key="GK000000000000000000000000"
secret_key="0000000000000000000000000000000000000000000000000000000000000000"
base_url="http://127.0.0.1:54080"

compose() {
  WORK_ITEMS_IMAGE="$app_image" docker compose \
    --project-name "$project_name" \
    --file "$compose_file" \
    "$@"
}

cleanup() {
  compose down --volumes --remove-orphans >/dev/null 2>&1 || true
}
trap cleanup EXIT

cleanup
compose up --detach postgres garage

for attempt in $(seq 1 60); do
  if compose exec --no-TTY postgres pg_isready -U appuser -d appdb >/dev/null \
    && compose exec --no-TTY garage /garage status >/dev/null 2>&1; then
    break
  fi
  if [[ "$attempt" = "60" ]]; then
    compose logs --no-color postgres garage
    exit 1
  fi
  sleep 1
done

node_id="$(compose exec --no-TTY garage /garage node id -q)"
node_id="${node_id%%@*}"
compose exec --no-TTY garage /garage layout assign \
  --zone readiness \
  --capacity 1GB \
  "$node_id" >/dev/null
compose exec --no-TTY garage /garage layout apply --version 1 >/dev/null
compose exec --no-TTY garage /garage key import \
  --yes \
  -n work-items-readiness-test-app \
  "$access_key" \
  "$secret_key" >/dev/null
compose exec --no-TTY garage /garage bucket create "$own_bucket" >/dev/null
compose exec --no-TTY garage /garage bucket create "$foreign_bucket" >/dev/null
compose exec --no-TTY garage /garage bucket allow \
  --read \
  --write \
  "$own_bucket" \
  --key work-items-readiness-test-app >/dev/null

DATABASE_URL="postgresql://appuser:readiness-test-password@127.0.0.1:55432/appdb?schema=public" \
  pnpm --filter @digicolony/db exec prisma db push \
    --schema prisma/schema.prisma \
    --skip-generate >/dev/null

DATABASE_URL="postgresql://appuser:readiness-test-password@127.0.0.1:55432/appdb?schema=public" \
  SEED_DEFAULT_PASSWORD="ChangeMe123!" \
  pnpm --filter @digicolony/db prisma:seed >/dev/null

compose up --detach app

readiness=""
for attempt in $(seq 1 60); do
  readiness="$(curl --silent --max-time 5 "$base_url/api/ready" || true)"
  if grep -Fq '"status":"ok"' <<<"$readiness"; then
    break
  fi
  if [[ "$attempt" = "60" ]]; then
    printf 'readiness=%s\n' "$readiness"
    compose logs --no-color app
    exit 1
  fi
  sleep 1
done

curl --fail --silent --max-time 5 "$base_url/api/health" \
  | grep -Fq '"status":"ok"'
curl --fail --silent --max-time 5 "$base_url/api/ready" \
  | grep -Fq '"database":"ok","storage":"ok"'

S3_ENDPOINT="http://127.0.0.1:53900" \
  S3_REGION="garage" \
  S3_BUCKET="$own_bucket" \
  S3_ACCESS_KEY_ID="$access_key" \
  S3_SECRET_ACCESS_KEY="$secret_key" \
  S3_FORCE_PATH_STYLE="true" \
  GARAGE_DENIED_BUCKET="$foreign_bucket" \
  pnpm --filter @digicolony/db storage:verify-isolation \
    | grep -Fq '"foreignBucketAccess":"denied"'

PLAYWRIGHT_BASE_URL="$base_url" \
  E2E_ADMIN_EMAIL="admin@digicolony.local" \
  E2E_ADMIN_PASSWORD="ChangeMe123!" \
  E2E_PROJECT_ID="seed-project-client-portal" \
  pnpm exec playwright test \
    --config playwright.external.config.ts

compose stop garage >/dev/null
readiness="$(curl --silent --max-time 10 "$base_url/api/ready")"
grep -Fq '"status":"unavailable"' <<<"$readiness"
grep -Fq '"database":"ok","storage":"unavailable"' <<<"$readiness"
compose start garage >/dev/null

for attempt in $(seq 1 30); do
  if curl --fail --silent --max-time 5 "$base_url/api/ready" \
    | grep -Fq '"status":"ok"'; then
    break
  fi
  if [[ "$attempt" = "30" ]]; then
    exit 1
  fi
  sleep 1
done

compose stop postgres >/dev/null
readiness="$(curl --silent --max-time 10 "$base_url/api/ready")"
grep -Fq '"status":"unavailable"' <<<"$readiness"
grep -Fq '"database":"unavailable","storage":"ok"' <<<"$readiness"
compose start postgres >/dev/null

for attempt in $(seq 1 30); do
  if curl --fail --silent --max-time 5 "$base_url/api/ready" \
    | grep -Fq '"status":"ok"'; then
    break
  fi
  if [[ "$attempt" = "30" ]]; then
    exit 1
  fi
  sleep 1
done

container_id="$(compose ps --quiet app)"
test "$(docker inspect "$container_id" --format '{{.Config.User}}')" = "nextjs"
test "$(docker inspect "$container_id" --format '{{.HostConfig.Memory}}')" = "2147483648"
test "$(docker inspect "$container_id" --format '{{.HostConfig.NanoCpus}}')" = "1500000000"
test "$(docker inspect "$container_id" --format '{{.HostConfig.PidsLimit}}')" = "256"

printf 'liveness=passed\n'
printf 'dependency_readiness=passed\n'
printf 'garage_unavailable_and_recovery=passed\n'
printf 'postgresql_unavailable_and_recovery=passed\n'
printf 'foreign_bucket_denial=passed\n'
printf 'authentication_permissions_and_file_flows=passed\n'
printf 'non_root_and_resource_limits=passed\n'
