#!/usr/bin/env bash
set -euo pipefail

garage_container="sheldon-garage"
garage_image="dxflrs/garage:v2.2.0"
garage_config="$HOME/.config/sheldon/garage/garage.toml"
backup_root="$HOME/sheldon/shared/garage/backups"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
archive_name="garage-$timestamp.tgz"
archive_path="$backup_root/$archive_name"
restore_container="sheldon-garage-restore-$timestamp"
restore_network="sheldon-garage-restore-$timestamp"
restore_meta="sheldon-garage-restore-meta-$timestamp"
restore_data="sheldon-garage-restore-data-$timestamp"

install -d -m 700 "$backup_root"
test -f "$garage_config"
docker --context rootless container inspect "$garage_container" >/dev/null
docker --context rootless pull alpine:3.22 >/dev/null

restart_live=false
cleanup_live() {
  if [[ "$restart_live" = true ]]; then
    docker --context rootless start "$garage_container" >/dev/null || true
  fi
}
trap cleanup_live EXIT

docker --context rootless stop "$garage_container" >/dev/null
restart_live=true
docker --context rootless run --rm \
  --mount type=volume,source=sheldon-garage-meta,target=/source/meta,readonly \
  --mount type=volume,source=sheldon-garage-data,target=/source/data,readonly \
  --mount type=bind,source="$backup_root",target=/backup \
  alpine:3.22 \
  tar -C /source -czf "/backup/$archive_name" meta data
install -m 600 "$garage_config" "$backup_root/garage-$timestamp.toml"
chmod 600 "$archive_path"
sha256sum "$archive_path" >"$archive_path.sha256"
chmod 600 "$archive_path.sha256"
docker --context rootless start "$garage_container" >/dev/null
restart_live=false

docker --context rootless volume create "$restore_meta" >/dev/null
docker --context rootless volume create "$restore_data" >/dev/null
docker --context rootless network create "$restore_network" >/dev/null

cleanup_restore() {
  docker --context rootless rm -f "$restore_container" >/dev/null 2>&1 || true
  docker --context rootless network rm "$restore_network" >/dev/null 2>&1 || true
  docker --context rootless volume rm "$restore_meta" >/dev/null 2>&1 || true
  docker --context rootless volume rm "$restore_data" >/dev/null 2>&1 || true
}
trap 'cleanup_restore; cleanup_live' EXIT

docker --context rootless run --rm \
  --mount type=bind,source="$backup_root",target=/backup,readonly \
  --mount type=volume,source="$restore_meta",target=/restore/meta \
  --mount type=volume,source="$restore_data",target=/restore/data \
  alpine:3.22 \
  tar -C /restore -xzf "/backup/$archive_name"

docker --context rootless run -d \
  --name "$restore_container" \
  --network "$restore_network" \
  --network-alias sheldon-garage \
  --mount type=bind,source="$garage_config",target=/etc/garage.toml,readonly \
  --mount type=volume,source="$restore_meta",target=/var/lib/garage/meta \
  --mount type=volume,source="$restore_data",target=/var/lib/garage/data \
  "$garage_image" \
  /garage server >/dev/null

for attempt in $(seq 1 30); do
  if docker --context rootless exec "$restore_container" /garage status >/dev/null 2>&1; then
    break
  fi
  if [[ "$attempt" = "30" ]]; then
    docker --context rootless logs --tail 50 "$restore_container"
    exit 1
  fi
  sleep 1
done

docker --context rootless exec "$restore_container" /garage bucket list | grep -Fq digicolony-client-ops
docker --context rootless exec "$restore_container" /garage key list | grep -Fq digicolony-client-ops-app
docker --context rootless exec "$restore_container" /garage stats >/dev/null

checksum="$(cut -d' ' -f1 "$archive_path.sha256")"
cleanup_restore
trap - EXIT

printf 'backup_archive=%s\n' "$archive_path"
printf 'backup_sha256=%s\n' "$checksum"
printf 'restore_bucket=digicolony-client-ops\n'
printf 'restore_verification=passed\n'
printf 'temporary_restore_resources=removed\n'
