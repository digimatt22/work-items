# Deploying DigiColony Client Operations to Sheldon

Use the Codex skill `$deploy-to-sheldon` for deployment, status, and rollback operations.

- Deployment configuration is in `sheldon.json`.
- The public target is `https://portal.digicolony.net`.
- The container serves Next.js on `0.0.0.0:3000`. `/api/health` remains
  process-only liveness; `/api/ready` performs bounded PostgreSQL and Garage
  checks and returns only sanitized component statuses.
- Run `pnpm lint`, `pnpm test`, `pnpm build`, and a local container build before deployment.
- Never commit or upload `.env` files. Secrets live on Sheldon in `~/.config/sheldon/secrets/<app>.env`.
- `~/.config/sheldon/secrets/digicolony-client-ops.env` must be mode `0600` and define the names listed in `sheldon.json`, including the database/authentication values, the `STORAGE_PROVIDER`/`S3_*` Garage connection values, and the four independent `DIGI_PORTAL_*` rollout settings.
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

- The active migration plan is
  [Migrate Work Items To Sheldon Deploy 0.2.0](docs/exec-plans/active/migrate-work-items-to-sheldon-deploy-0-2.md).
- The read-only live baseline is
  [Sheldon 0.2 Migration Baseline](docs/deployments/sheldon-0-2-migration-baseline-2026-07-24.md).
- Database operations follow
  [Work Items Database Operations](docs/runbooks/work-items-database-operations.md).
- Garage operations follow
  [Work Items Garage Operations](docs/runbooks/work-items-garage-operations.md).
- Release and rollback follow
  [Work Items Release And Rollback](docs/runbooks/work-items-release-and-rollback.md).
- `sheldon.json` must remain schema 1 until the released Sheldon Deploy 0.2.0
  field definitions and validator are installed. Do not guess schema-2 field
  names from the platform plan.
- Schema 2 will describe PostgreSQL as an external stateful dependency and
  Garage as an existing Sheldon platform dependency. Adoption does not
  authorize database, secret, Garage, network, volume, Caddy, container,
  deployment, or rollback mutation.

## Current deployment notes

- Live release `20260724T140218Z` is deployed at `https://portal.digicolony.net` with origin `127.0.0.1:39732`, per-client-user permission assignment, client-first administrator project selection, project-only client reporting, the Digi-Portal administrator binding form enabled, and the agent read/mutation gates disabled. It was packaged from clean committed source `7d92fbc`.
- PostgreSQL is reached through its rootful internal network at `172.18.0.2:5432`. The rootless application network is pinned to `172.30.0.0/16` in the deployed Compose file to prevent a subnet collision. Reverify this route after Docker network or PostgreSQL topology changes.
- Asset storage on Sheldon uses the private `sheldon-garage` container, pinned to `dxflrs/garage:v2.2.0`, with no published ports. Garage shares `sheldon-digicolony-client-ops_default` with the portal, uses the private bucket `digicolony-client-ops`, and persists LMDB metadata and object data in `sheldon-garage-meta` and `sheldon-garage-data`.
- `scripts/provision-garage-on-sheldon-remote.sh` is the idempotent bootstrap record. `scripts/backup-and-verify-garage-on-sheldon-remote.sh` stops Garage briefly, creates a mode-`0600` archive under `~/sheldon/shared/garage/backups/`, restores into isolated temporary volumes, verifies the bucket/key/statistics, and removes the temporary restore resources.
- Backup `garage-20260721T201449Z.tgz` passed an isolated restore drill. Its SHA-256 is `3370a4a5db9a5f65eed646b68b0c9c11671d7ea93828b86c570e6c6e6ac1b03b`. This is server-local protection only; a Sheldon disk failure still requires an approved off-server copy.
- Read-only schema-2 migration inventory on 2026-07-24 reconfirmed 3 users,
  3 credentials, 3 clients, 6 projects, 1 work item, 2 assets, 2 asset links,
  and 2 revoked deliverable shares. PostgreSQL database/role connection limits
  are currently unbounded and no Prisma migration ledger exists.
- The same inventory found Garage healthy with 2 objects totaling 112 bytes,
  Work Items read/write permission only on its existing bucket, no bucket
  creation authority, preserved volumes, and no published ports. Garage has no
  second application bucket yet, so a real foreign-bucket HTTP `403` remains
  an approval-readiness gap.
- Sheldon plugin version `0.1.0+codex.20260717125641` excludes mutable/test output, assigns every Next.js release a deployment ID, and mounts the stable Server Action encryption key as a build-only secret. This lets stale tabs recover from version skew without placing the key in a release archive, Compose build argument, or image layer.
- Local candidate validation uses
  `scripts/test-sheldon-readiness-containers.sh` for browser, dependency,
  bucket-isolation, non-root, and resource-limit checks, and
  `scripts/test-server-action-release-skew.sh` for A-to-B stale-tab recovery.
  Both use disposable local services and test-only credentials.
- Configure the Git remote and obtain review before treating the local deployment changes as shared project history.
- The live database was originally initialized with Prisma schema synchronization and has no `_prisma_migrations` ledger. The additive `mustChangePassword` column was applied transactionally before release `20260717T132949Z`; do not run `prisma migrate deploy` against Sheldon until the existing schema has been formally baselined.
- Migrations `0004_agent_delivery_foundation` and `0005_digi_portal_oauth` were applied together as reviewed raw SQL in one transaction on 2026-07-21. The pre-migration full PostgreSQL backup is `/home/mwood/sheldon/apps/digicolony-client-ops/backups/pre-digi-portal-0004-0005-20260721T204511Z.dump`, mode `0600`, with SHA-256 `fb9eab6fe8571aa240282ae2a7259f50b6ab4d2dd55a0cfde1274f2345895c03`. Protected user, credential, client, project, and work-item counts were unchanged after migration.
- Sheldon enables administrator binding setup with `DIGI_PORTAL_PLATFORM_URL=https://portal.digicolony.net` and `DIGI_PORTAL_ADMIN_BINDINGS_ENABLED=true`. Agent reads and mutations remain explicitly disabled through their independent rollout flags.
- Migration `0006_project_deliverable_sharing` was applied as reviewed raw SQL in one transaction before release `20260721T184200Z`. A schema-only recovery snapshot is stored server-side at `/home/mwood/sheldon/apps/digicolony-client-ops/backups/pre-f885ac4-schema.sql`, mode `0600`. Existing users, password credentials, clients, projects, and work items were verified unchanged before and after the migration and deployment.
- Migration `0007_client_user_permissions` was applied as reviewed raw SQL in one transaction before release `20260724T134359Z`. Full custom-format backup `/home/mwood/sheldon/apps/digicolony-client-ops/backups/pre-client-user-permissions-20260724T133857Z.dump` passed `pg_restore --list`, is mode `0600`, and has SHA-256 `38919ac64d6eed231653e3ac9ea41d37309e0ff177085d94591e3701a4c9cb0f`. Protected counts remained 3 users, 3 credentials, 3 clients, 6 projects, and 1 work item; all existing users retained the safe empty-permissions default.

Initialization does not authorize a deployment, rollback, secret change, database change, or Cloudflare route change. Each live operation needs explicit authorization through the deployment skill.
