# Work Items Database Operations

## Purpose

This runbook defines the external PostgreSQL dependency contract for Work Items.
It records metadata and safe checks without storing the database URL or
password. Database backup, restore check, migration, baseline, credential
change, and rollback are separate operations with separate approvals.

## Preserved Identity

- Engine: PostgreSQL 17
- Current server process: `/srv/dev-stack/compose.yaml` on Sheldon
- Database: `appdb`
- Runtime role: `appuser`
- Persistent volume: `dev-stack_postgres_data`
- Application connection secret: `DATABASE_URL` in the mode-`0600` Work Items
  Sheldon environment file

Do not rename the database or role, change credentials, move data, or alter the
volume as part of the deployment-contract migration.

After Relay Hub moves to its dedicated database process, treat this PostgreSQL
process as the Work Items database instance. It remains on the same Sheldon
host and therefore does not provide host-level high availability.

## Current Migration State

- The initial live schema was synchronized without a
  `_prisma_migrations` ledger.
- `0003_force_password_change` through
  `0007_client_user_permissions` were applied through separately reviewed,
  transactional SQL operations.
- Do not run `prisma migrate deploy` until an independently reviewed baseline
  operation records the live schema as the starting migration state.
- Application rollback never runs a down migration, resets the database, or
  changes the migration ledger.

## Connection Policy

The schema-2 manifest must declare:

- connect timeout: 5 seconds;
- dependency readiness timeout: 2 seconds;
- statement timeout: 5 seconds for operational inventory/readiness;
- lock timeout: 1 second for operational inventory;
- application pool ceiling: 10 connections;
- database and role connection ceilings as declared drift checks.

Read-only inventory on 2026-07-24 found database and role limits of `-1`
(unbounded), the default statement timeout effectively unbounded outside the
bounded inventory transaction, and the default lock timeout disabled. These
are actionable drift from the target contract. Changing PostgreSQL role,
database, or application connection settings requires a separate database or
secret approval and is not authorized by adopting schema 2.

## Readiness

`GET /api/ready` runs `SELECT 1` with a two-second application deadline in
parallel with the storage check. The public response contains only:

```json
{
  "status": "ok",
  "checks": {
    "database": "ok",
    "storage": "ok"
  }
}
```

Any dependency error or timeout returns HTTP `503` and replaces the relevant
component value with `unavailable`. Connection strings, role passwords, SQL
errors, host addresses, and customer data are never returned.

## Read-Only Inventory Hook

Run on Sheldon:

```sh
scripts/inventory-work-items-database-on-sheldon-remote.sh
```

The script:

- requires the protected environment file to remain mode `0600`;
- strips Prisma's `schema` query parameter before invoking `psql`;
- starts a read-only transaction;
- bounds connection, statement, and lock waits;
- prints version, database/role names, connection-limit metadata, migration
  ledger presence, and protected table counts;
- never prints `DATABASE_URL` or any password.

## Backup Hook

A fresh logical backup is a separately approved operation. The approval request
must name the output path, expected free-space impact, retention, validation,
and cleanup policy. The hook should:

1. create a custom-format `pg_dump` for `appdb`;
2. set mode `0600`;
3. write a SHA-256 sidecar;
4. run `pg_restore --list`;
5. record the source PostgreSQL version and protected counts;
6. leave existing backups untouched.

The latest recorded full backup is
`pre-client-user-permissions-20260724T133857Z.dump`, mode `0600`, SHA-256
`38919ac64d6eed231653e3ac9ea41d37309e0ff177085d94591e3701a4c9cb0f`.
`pg_restore --list` passed. It predates no later database migration, but an
isolated database restore from this backup is not yet recorded.

## Restore-Check Hook

An isolated restore check is a separately approved operation because it creates
temporary server state. It must:

1. select an exact backup by path and SHA-256;
2. restore into a new temporary PostgreSQL database or isolated instance;
3. prevent application traffic from reaching the restored target;
4. compare PostgreSQL version, schema objects, migration state, and protected
   counts;
5. record failures without customer row contents;
6. remove only the explicitly named temporary database/container/volume after
   verification;
7. never touch `appdb`, `appuser`, or `dev-stack_postgres_data`.

Live deployment approval remains blocked until current backup and isolated
restore-check evidence are recorded.

## Failure Reporting

- `database=unavailable`: application readiness returns `503`; liveness remains
  independent so operators can distinguish a running app from a usable app.
- Inventory or backup failure: record the step and sanitized error category;
  do not retry a write automatically.
- Migration failure: do not switch the application release. Inspect the
  transaction result and protected counts before any retry.
- Application failure after an approved migration: roll back only to an
  application release compatible with the current schema. Do not downgrade the
  database.
