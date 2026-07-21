# Deploying DigiColony Client Operations to Sheldon

Use the Codex skill `$deploy-to-sheldon` for deployment, status, and rollback operations.

- Deployment configuration is in `sheldon.json`.
- The public target is `https://portal.digicolony.net`.
- The container serves Next.js on `0.0.0.0:3000`; Sheldon probes `/api/health` without querying PostgreSQL.
- Run `pnpm lint`, `pnpm test`, `pnpm build`, and a local container build before deployment.
- Never commit or upload `.env` files. Secrets live on Sheldon in `~/.config/sheldon/secrets/<app>.env`.
- `~/.config/sheldon/secrets/digicolony-client-ops.env` must be mode `0600` and define the names listed in `sheldon.json`, including the database/authentication values and the `STORAGE_PROVIDER`/`S3_*` Garage connection values.
- Set `AUTH_URL=https://portal.digicolony.net` so Auth.js emits public sign-in and callback URLs instead of container-internal URLs.
- The production `DATABASE_URL` must be reachable from inside the rootless application container. Do not reuse the local development URL whose host is `localhost`.
- Applications must listen on `0.0.0.0` inside the container.
- Preview the deployment plan before changing the server.
- Deployments bind only to loopback and are exposed through Caddy.
- Cloudflare needs a Published application route from `portal.digicolony.net` to `http://localhost:80`.
- Verify the health endpoint and public HTTPS after deployment.
- Preserve the prior release for rollback.

## Current deployment notes

- Live release `20260721T201923Z` is deployed at `https://portal.digicolony.net` with origin `127.0.0.1:39732` and the additive project-deliverable-sharing schema applied transactionally beforehand.
- PostgreSQL is reached through its rootful internal network at `172.18.0.2:5432`. The rootless application network is pinned to `172.30.0.0/16` in the deployed Compose file to prevent a subnet collision. Reverify this route after Docker network or PostgreSQL topology changes.
- Asset storage on Sheldon uses the private `sheldon-garage` container, pinned to `dxflrs/garage:v2.2.0`, with no published ports. Garage shares `sheldon-digicolony-client-ops_default` with the portal, uses the private bucket `digicolony-client-ops`, and persists LMDB metadata and object data in `sheldon-garage-meta` and `sheldon-garage-data`.
- `scripts/provision-garage-on-sheldon-remote.sh` is the idempotent bootstrap record. `scripts/backup-and-verify-garage-on-sheldon-remote.sh` stops Garage briefly, creates a mode-`0600` archive under `~/sheldon/shared/garage/backups/`, restores into isolated temporary volumes, verifies the bucket/key/statistics, and removes the temporary restore resources.
- Backup `garage-20260721T201449Z.tgz` passed an isolated restore drill. Its SHA-256 is `3370a4a5db9a5f65eed646b68b0c9c11671d7ea93828b86c570e6c6e6ac1b03b`. This is server-local protection only; a Sheldon disk failure still requires an approved off-server copy.
- Sheldon plugin version `0.1.0+codex.20260717125641` excludes mutable/test output, assigns every Next.js release a deployment ID, and mounts the stable Server Action encryption key as a build-only secret. This lets stale tabs recover from version skew without placing the key in a release archive, Compose build argument, or image layer.
- Configure the Git remote and obtain review before treating the local deployment changes as shared project history.
- The live database was originally initialized with Prisma schema synchronization and has no `_prisma_migrations` ledger. The additive `mustChangePassword` column was applied transactionally before release `20260717T132949Z`; do not run `prisma migrate deploy` against Sheldon until the existing schema has been formally baselined.
- Migrations `0004_agent_delivery_foundation` and `0005_digi_portal_oauth` were applied together as reviewed raw SQL in one transaction on 2026-07-21. The pre-migration full PostgreSQL backup is `/home/mwood/sheldon/apps/digicolony-client-ops/backups/pre-digi-portal-0004-0005-20260721T204511Z.dump`, mode `0600`, with SHA-256 `fb9eab6fe8571aa240282ae2a7259f50b6ab4d2dd55a0cfde1274f2345895c03`. Protected user, credential, client, project, and work-item counts were unchanged after migration.
- Migration `0006_project_deliverable_sharing` was applied as reviewed raw SQL in one transaction before release `20260721T184200Z`. A schema-only recovery snapshot is stored server-side at `/home/mwood/sheldon/apps/digicolony-client-ops/backups/pre-f885ac4-schema.sql`, mode `0600`. Existing users, password credentials, clients, projects, and work items were verified unchanged before and after the migration and deployment.

Initialization does not authorize a deployment, rollback, secret change, database change, or Cloudflare route change. Each live operation needs explicit authorization through the deployment skill.
