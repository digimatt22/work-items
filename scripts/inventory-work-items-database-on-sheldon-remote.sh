#!/usr/bin/env bash
set -euo pipefail

app_name="digicolony-client-ops"
app_env="$HOME/.config/sheldon/secrets/$app_name.env"

test -f "$app_env"
test "$(stat -c '%a' "$app_env")" = "600"

set -a
# shellcheck disable=SC1090
. "$app_env"
set +a

test -n "${DATABASE_URL:-}"
psql_url="${DATABASE_URL%%\?*}"

PGCONNECT_TIMEOUT=5 psql "$psql_url" \
  -X \
  --no-psqlrc \
  --no-align \
  --tuples-only \
  --set ON_ERROR_STOP=1 <<'SQL'
BEGIN READ ONLY;
SET LOCAL statement_timeout = '5s';
SET LOCAL lock_timeout = '1s';
SELECT 'server_version|' || current_setting('server_version');
SELECT 'database|' || current_database();
SELECT 'role|' || current_user;
SELECT 'database_connection_limit|' || datconnlimit
FROM pg_database
WHERE datname = current_database();
SELECT 'role_connection_limit|' || rolconnlimit
FROM pg_roles
WHERE rolname = current_user;
SELECT 'configured_statement_timeout|' || current_setting('statement_timeout');
SELECT 'configured_lock_timeout|' || current_setting('lock_timeout');
SELECT 'prisma_migration_ledger|' ||
  (to_regclass('public._prisma_migrations') IS NOT NULL);
SELECT 'users|' || count(*) FROM "User";
SELECT 'password_credentials|' || count(*) FROM "PasswordCredential";
SELECT 'clients|' || count(*) FROM "Client";
SELECT 'projects|' || count(*) FROM "Project";
SELECT 'work_items|' || count(*) FROM "WorkItem";
SELECT 'assets|' || count(*) FROM "Asset";
SELECT 'asset_links|' || count(*) FROM "AssetLink";
SELECT 'deliverable_shares|' || count(*) FROM "DeliverableShare";
SELECT 'project_bindings|' || count(*) FROM "ProjectBinding";
SELECT 'oauth_access_grants|' || count(*) FROM "McpAccessGrant";
COMMIT;
SQL
