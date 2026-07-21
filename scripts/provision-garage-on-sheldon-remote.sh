#!/usr/bin/env bash
set -euo pipefail

app_name="digicolony-client-ops"
app_network="sheldon-digicolony-client-ops_default"
garage_container="sheldon-garage"
garage_image="dxflrs/garage:v2.2.0"
garage_dir="$HOME/.config/sheldon/garage"
garage_config="$garage_dir/garage.toml"
app_env="$HOME/.config/sheldon/secrets/$app_name.env"
initialized_marker="$garage_dir/initialized-v2.2.0"

install -d -m 700 "$garage_dir"
test -f "$app_env"
test "$(stat -c '%a' "$app_env")" = "600"
docker --context rootless network inspect "$app_network" >/dev/null

if [[ ! -f "$garage_config" ]]; then
  rpc_secret="$(openssl rand -hex 32)"
  admin_token="$(openssl rand -base64 32)"
  metrics_token="$(openssl rand -base64 32)"

  install -m 600 /dev/null "$garage_config"
  {
    printf 'metadata_dir = "/var/lib/garage/meta"\n'
    printf 'data_dir = "/var/lib/garage/data"\n'
    printf 'db_engine = "lmdb"\n'
    printf 'metadata_auto_snapshot_interval = "6h"\n'
    printf 'replication_factor = 1\n'
    printf 'rpc_bind_addr = "[::]:3901"\n'
    printf 'rpc_public_addr = "%s:3901"\n' "$garage_container"
    printf 'rpc_secret = "%s"\n\n' "$rpc_secret"
    printf '[s3_api]\n'
    printf 's3_region = "garage"\n'
    printf 'api_bind_addr = "[::]:3900"\n\n'
    printf '[admin]\n'
    printf 'api_bind_addr = "[::]:3903"\n'
    printf 'admin_token = "%s"\n' "$admin_token"
    printf 'metrics_token = "%s"\n' "$metrics_token"
  } >"$garage_config"
fi

docker --context rootless volume create sheldon-garage-meta >/dev/null
docker --context rootless volume create sheldon-garage-data >/dev/null

access_key="$(sed -n 's/^S3_ACCESS_KEY_ID=//p' "$app_env" | tail -n 1)"
secret_key="$(sed -n 's/^S3_SECRET_ACCESS_KEY=//p' "$app_env" | tail -n 1)"

if [[ -z "$access_key" || -z "$secret_key" ]]; then
  access_key="GK$(openssl rand -hex 12)"
  secret_key="$(openssl rand -hex 32)"
fi

if docker --context rootless container inspect "$garage_container" >/dev/null 2>&1 \
  && [[ "$(docker --context rootless inspect "$garage_container" --format '{{.State.Running}}')" != "true" ]]; then
  docker --context rootless rm -f "$garage_container" >/dev/null
fi

if ! docker --context rootless container inspect "$garage_container" >/dev/null 2>&1; then
  docker --context rootless run -d \
    --name "$garage_container" \
    --restart unless-stopped \
    --network "$app_network" \
    --mount type=bind,source="$garage_config",target=/etc/garage.toml,readonly \
    --mount type=volume,source=sheldon-garage-meta,target=/var/lib/garage/meta \
    --mount type=volume,source=sheldon-garage-data,target=/var/lib/garage/data \
    "$garage_image" \
    /garage server >/dev/null
fi

for attempt in $(seq 1 30); do
  if docker --context rootless exec "$garage_container" /garage status >/dev/null 2>&1; then
    break
  fi
  if [[ "$attempt" = "30" ]]; then
    docker --context rootless logs --tail 50 "$garage_container"
    exit 1
  fi
  sleep 1
done

if [[ ! -f "$initialized_marker" ]]; then
  layout_version="$(docker --context rootless exec "$garage_container" /garage layout show | sed -n 's/^Current cluster layout version: //p')"
  if [[ "$layout_version" = "0" ]]; then
    node_id="$(docker --context rootless exec "$garage_container" /garage node id -q)"
    node_id="${node_id%%@*}"
    docker --context rootless exec "$garage_container" /garage layout assign -z sheldon -c 150GB "$node_id" >/dev/null
    docker --context rootless exec "$garage_container" /garage layout apply --version 1 >/dev/null
  fi
  if ! docker --context rootless exec "$garage_container" /garage key list | grep -Fq "$access_key"; then
    docker --context rootless exec "$garage_container" /garage key import --yes -n "$app_name-app" "$access_key" "$secret_key" >/dev/null
  fi
  if ! docker --context rootless exec "$garage_container" /garage bucket list | grep -Fq "$app_name"; then
    docker --context rootless exec "$garage_container" /garage bucket create "$app_name" >/dev/null
  fi
  docker --context rootless exec "$garage_container" /garage bucket allow --read --write "$app_name" --key "$app_name-app" >/dev/null
  install -m 600 /dev/null "$initialized_marker"
fi

temporary_env="$(mktemp)"
grep -Ev '^(STORAGE_PROVIDER|S3_ENDPOINT|S3_REGION|S3_BUCKET|S3_ACCESS_KEY_ID|S3_SECRET_ACCESS_KEY|S3_FORCE_PATH_STYLE)=' "$app_env" >"$temporary_env" || true
{
  cat "$temporary_env"
  printf 'STORAGE_PROVIDER=s3\n'
  printf 'S3_ENDPOINT=http://%s:3900\n' "$garage_container"
  printf 'S3_REGION=garage\n'
  printf 'S3_BUCKET=%s\n' "$app_name"
  printf 'S3_ACCESS_KEY_ID=%s\n' "$access_key"
  printf 'S3_SECRET_ACCESS_KEY=%s\n' "$secret_key"
  printf 'S3_FORCE_PATH_STYLE=true\n'
} >"$temporary_env.updated"
install -m 600 "$temporary_env.updated" "$app_env"
rm -f "$temporary_env" "$temporary_env.updated"

printf 'garage_container=%s\n' "$garage_container"
printf 'garage_image=%s\n' "$garage_image"
printf 'garage_network=%s\n' "$app_network"
printf 'garage_bucket=%s\n' "$app_name"
printf 'garage_meta_volume=sheldon-garage-meta\n'
printf 'garage_data_volume=sheldon-garage-data\n'
