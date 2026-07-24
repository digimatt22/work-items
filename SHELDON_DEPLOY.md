# Deploying DigiColony Client Operations to Sheldon

Use the Codex skill `$deploy-to-sheldon` for deployment, status, and rollback operations.

- Deployment configuration is in `sheldon.json`.
- The public target is `https://portal.digicolony.net`.
- The container serves Next.js on `0.0.0.0:3000`. `/api/health` remains
  process-only liveness; `/api/ready` performs bounded PostgreSQL and Garage
  checks and returns only sanitized component statuses.
- Run `pnpm lint`, `pnpm test`, `pnpm build`, and a local container build before deployment.
- Never commit or upload `.env` files. Secrets live on Sheldon in `~/.config/sheldon/secrets/<app>.env`.
- `~/.config/sheldon/secrets/digicolony-client-ops.env` must be mode `0600` and define the names listed in `sheldon.json`, including the separately scoped `DATABASE_URL`, `DATABASE_MIGRATION_URL`, and `DATABASE_BACKUP_URL` names, the authentication values, the `STORAGE_PROVIDER`/`S3_*` Garage connection values, and the four independent `DIGI_PORTAL_*` rollout settings. Adding the two database URL names is a separately approved secret-file change; it does not rotate the existing `appuser` credential.
- Set `AUTH_URL=https://portal.digicolony.net` so Auth.js emits public sign-in and callback URLs instead of container-internal URLs.
- The production `DATABASE_URL` must be reachable from inside the rootless application container. Do not reuse the local development URL whose host is `localhost`.
- Applications must listen on `0.0.0.0` inside the container.
- Preview the deployment plan before changing the server.
- Deployments bind only to loopback and are exposed through Caddy.
- Cloudflare needs a Published application route from `portal.digicolony.net` to `http://localhost:80`.
- Verify the health endpoint and public HTTPS after deployment.
- Preserve the prior release for rollback.
- Application rollback never runs a database downgrade, restore, reset, seed,
  or Garage topology change.

## Sheldon 0.2 migration

- The completed migration plan is
  [Migrate Work Items To Sheldon Deploy 0.2](docs/exec-plans/completed/migrate-work-items-to-sheldon-deploy-0-2.md).
- The completed live evidence is
  [Sheldon 0.2.1 Live Migration](docs/deployments/sheldon-0-2-1-live-migration-2026-07-24.md).
- The read-only live baseline is
  [Sheldon 0.2 Migration Baseline](docs/deployments/sheldon-0-2-migration-baseline-2026-07-24.md).
- Database operations follow
  [Work Items Database Operations](docs/runbooks/work-items-database-operations.md).
- Garage operations follow
  [Work Items Garage Operations](docs/runbooks/work-items-garage-operations.md).
- Release and rollback follow
  [Work Items Release And Rollback](docs/runbooks/work-items-release-and-rollback.md).
- `sheldon.json` uses the Sheldon Deploy schema-2 contract introduced in 0.2.0
  from
  canonical source commit `3213a091718177bcbf2fed69fd91bb72dacca322`.
- The schema declares exact Git source, non-root runtime identity, bounded
  resources, deployment locking, five-release retention, external PostgreSQL
  metadata and hooks, and the existing Garage service as a platform
  dependency. It contains secret names only, never secret values.
- The database hooks are copied into the immutable runtime image. Backup emits
  `sheldon-envelope-v1`; restore verification runs with no network, a read-only
  root filesystem, and a temporary filesystem, and must reproduce the recorded
  schema revision and protected row counts.
- The Garage isolation hook requires success on `digicolony-client-ops` and an
  HTTP `403` for the foreign sentinel `work-items-foreign-sentinel`. The
  sentinel exists without an application key, and Garage is attached to the
  stable platform network.
- Schema-2 adoption does not
  authorize database, secret, Garage, network, volume, Caddy, container,
  deployment, or rollback mutation.

## Current deployment notes

- Live release `20260724T221955Z-2fe481bb6c` is deployed at `https://portal.digicolony.net` with origin `127.0.0.1:39732`, per-client-user permission assignment, client-first administrator project selection, project-only client reporting, the Digi-Portal administrator binding form enabled, and the agent read/mutation gates disabled. It was packaged from clean committed source `70e24ca05931555f6367df9dc441a75025dd0da5`.
- PostgreSQL is reached through its rootful internal network at `172.18.0.2:5432`. The rootless application network uses the allocated `10.244.52.0/24` subnet, while database and Garage access use the stable `sheldon-digicolony-client-ops-platform` network at `10.152.101.0/24`.
- Asset storage on Sheldon uses the private `sheldon-garage` container, pinned to `dxflrs/garage:v2.2.0`, with no published ports. Garage shares the stable platform network with the portal, uses the private bucket `digicolony-client-ops`, and persists LMDB metadata and object data in `sheldon-garage-meta` and `sheldon-garage-data`.
- `scripts/provision-garage-on-sheldon-remote.sh` is the idempotent bootstrap record. `scripts/backup-and-verify-garage-on-sheldon-remote.sh` stops Garage briefly, creates a mode-`0600` archive under `~/sheldon/shared/garage/backups/`, restores into isolated temporary volumes, verifies the bucket/key/statistics, and removes the temporary restore resources.
- Backup `garage-20260721T201449Z.tgz` passed an isolated restore drill. Its SHA-256 is `3370a4a5db9a5f65eed646b68b0c9c11671d7ea93828b86c570e6c6e6ac1b03b`. This is server-local protection only; a Sheldon disk failure still requires an approved off-server copy.
- Post-deployment schema-2 inventory on 2026-07-24 reconfirmed 3 users,
  3 credentials, 3 clients, 6 projects, 1 work item, 2 assets, 2 asset links,
  and 2 revoked deliverable shares. Runtime role `appuser` has a connection
  limit of 10; no Prisma migration ledger exists.
- The same inventory found Garage healthy with 2 objects totaling 112 bytes,
  Work Items read/write permission only on its existing bucket, no bucket
  creation authority, preserved volumes, and no published ports. The empty
  `work-items-foreign-sentinel` bucket has no application key attached and
  provides the live foreign-bucket HTTP `403` isolation check.
- The schema-2 implementation was originally validated against Sheldon Deploy
  0.2.0 at canonical source commit
  `3213a091718177bcbf2fed69fd91bb72dacca322`. Current release operations use
  the installed 0.2.1 plugin and its bundled CLI.

### Sheldon Deploy 0.2.1 migration

- Version 0.2.1 fixes the read-only inventory collector defect recorded in the
  active migration plan. Its schema-2 plan and package audit pass from a clean
  temporary clone of exact commit
  `74cda4e0724fad96a332fc18f8a4e1a6695f101b`.
- The final release contains 467 committed files, no generated inputs, source
  commit `70e24ca05931555f6367df9dc441a75025dd0da5`, source digest
  `c02971d967b72dbc6fafb7c5bc84bda46fdccd28a32f2b3627812d3297e03272`,
  and manifest digest
  `a12cfe4c7aecd2d770c38d6411c37223f2dcf1ec99e8221018b3a78efdc26368`.
- Local lint, typecheck, all 70 unit tests, the Next.js production build, the
  exact-source production-image build, non-root runtime, and `/api/health`
  pass.
- Release `20260724T221955Z-2fe481bb6c` is live as schema-2 service `web`.
  Preflight and dependency checks pass for PostgreSQL, Garage, and Garage
  isolation. Status confirms HTTP 200, non-root UID/GID 1001, 2-GiB memory,
  1.5-CPU, and 256-PID limits.
- Inventory no longer reports the legacy invalid subnet, missing dependency
  metadata, missing backup/restore evidence, or an unmanaged image volume. Its
  critical `shared-database` and `shared-runtime-role` findings
  against the packaged `work-items` entry are a self-alias: that baseline entry
  describes this same application, not a second application.
- The protected database backup and isolated restore check passed with SHA-256
  `4ccf2efff322f252dd2f4f62c2d980655fa7e5e86f2c5db7de7fc1c75cb4e7a6`.
  Live browser verification passed desktop/mobile rendering, invalid-credential
  feedback, and unauthenticated protected-route enforcement.
- Sheldon excludes mutable/test output, assigns every Next.js release a deployment ID, and mounts the stable Server Action encryption key as a build-only secret. This lets stale tabs recover from version skew without placing the key in a release archive, Compose build argument, or image layer.
- Local candidate validation uses
  `scripts/test-sheldon-readiness-containers.sh` for browser, dependency,
  bucket-isolation, non-root, and resource-limit checks, and
  `scripts/test-server-action-release-skew.sh` for A-to-B stale-tab recovery.
  Both use disposable local services and test-only credentials. The latter
  creates its build-secret fixture in a mode-`0600` temporary file and removes
  it during cleanup, so no action key fixture enters committed release source.
- Configure the Git remote and obtain review before treating the local deployment changes as shared project history.
- The live database was originally initialized with Prisma schema synchronization and has no `_prisma_migrations` ledger. The additive `mustChangePassword` column was applied transactionally before release `20260717T132949Z`; do not run `prisma migrate deploy` against Sheldon until the existing schema has been formally baselined.
- Migrations `0004_agent_delivery_foundation` and `0005_digi_portal_oauth` were applied together as reviewed raw SQL in one transaction on 2026-07-21. The pre-migration full PostgreSQL backup is `/home/mwood/sheldon/apps/digicolony-client-ops/backups/pre-digi-portal-0004-0005-20260721T204511Z.dump`, mode `0600`, with SHA-256 `fb9eab6fe8571aa240282ae2a7259f50b6ab4d2dd55a0cfde1274f2345895c03`. Protected user, credential, client, project, and work-item counts were unchanged after migration.
- Sheldon enables administrator binding setup with `DIGI_PORTAL_PLATFORM_URL=https://portal.digicolony.net` and `DIGI_PORTAL_ADMIN_BINDINGS_ENABLED=true`. Agent reads and mutations remain explicitly disabled through their independent rollout flags.
- Migration `0006_project_deliverable_sharing` was applied as reviewed raw SQL in one transaction before release `20260721T184200Z`. A schema-only recovery snapshot is stored server-side at `/home/mwood/sheldon/apps/digicolony-client-ops/backups/pre-f885ac4-schema.sql`, mode `0600`. Existing users, password credentials, clients, projects, and work items were verified unchanged before and after the migration and deployment.
- Migration `0007_client_user_permissions` was applied as reviewed raw SQL in one transaction before release `20260724T134359Z`. Full custom-format backup `/home/mwood/sheldon/apps/digicolony-client-ops/backups/pre-client-user-permissions-20260724T133857Z.dump` passed `pg_restore --list`, is mode `0600`, and has SHA-256 `38919ac64d6eed231653e3ac9ea41d37309e0ff177085d94591e3701a4c9cb0f`. Protected counts remained 3 users, 3 credentials, 3 clients, 6 projects, and 1 work item; all existing users retained the safe empty-permissions default.

Initialization does not authorize a deployment, rollback, secret change, database change, or Cloudflare route change. Each live operation needs explicit authorization through the deployment skill.
