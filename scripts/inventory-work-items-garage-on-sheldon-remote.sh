#!/usr/bin/env bash
set -euo pipefail

garage_container="sheldon-garage"
garage_bucket="digicolony-client-ops"
garage_key="digicolony-client-ops-app"

docker --context rootless container inspect "$garage_container" >/dev/null
docker --context rootless exec "$garage_container" /garage status
docker --context rootless exec "$garage_container" /garage stats
docker --context rootless exec "$garage_container" \
  /garage bucket info "$garage_bucket"
docker --context rootless exec "$garage_container" \
  /garage key info "$garage_key"
docker --context rootless volume inspect \
  sheldon-garage-meta \
  sheldon-garage-data \
  --format '{{.Name}}|{{.Driver}}'
