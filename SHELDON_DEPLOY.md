# Deploying DigiColony Client Operations to Sheldon

Use the Codex skill `$deploy-to-sheldon` for deployment, status, and rollback operations.

- Deployment configuration is in `sheldon.json`.
- The public target is `https://portal.digicolony.net`.
- The container serves Next.js on `0.0.0.0:3000`; Sheldon probes `/api/health` without querying PostgreSQL.
- Run `pnpm lint`, `pnpm test`, `pnpm build`, and a local container build before deployment.
- Never commit or upload `.env` files. Secrets live on Sheldon in `~/.config/sheldon/secrets/<app>.env`.
- `~/.config/sheldon/secrets/digicolony-client-ops.env` must be mode `0600` and define `DATABASE_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST`, and `AUTH_URL`.
- Set `AUTH_URL=https://portal.digicolony.net` so Auth.js emits public sign-in and callback URLs instead of container-internal URLs.
- The production `DATABASE_URL` must be reachable from inside the rootless application container. Do not reuse the local development URL whose host is `localhost`.
- Applications must listen on `0.0.0.0` inside the container.
- Preview the deployment plan before changing the server.
- Deployments bind only to loopback and are exposed through Caddy.
- Cloudflare needs a Published application route from `portal.digicolony.net` to `http://localhost:80`.
- Verify the health endpoint and public HTTPS after deployment.
- Preserve the prior release for rollback.

## Current deployment notes

- Live release `20260717T132949Z` is deployed at `https://portal.digicolony.net` with origin `127.0.0.1:39732`.
- PostgreSQL is reached through its rootful internal network at `172.18.0.2:5432`. The rootless application network is pinned to `172.30.0.0/16` in the deployed Compose file to prevent a subnet collision. Reverify this route after Docker network or PostgreSQL topology changes.
- The current local asset provider writes uploads to the container filesystem. Sheldon releases do not mount persistent storage, so asset uploads will not survive a container replacement. Add a persistent storage strategy before treating uploaded assets as durable.
- Sheldon plugin version `0.1.0+codex.20260717125641` excludes mutable/test output, assigns every Next.js release a deployment ID, and mounts the stable Server Action encryption key as a build-only secret. This lets stale tabs recover from version skew without placing the key in a release archive, Compose build argument, or image layer.
- Configure the Git remote and obtain review before treating the local deployment changes as shared project history.
- The live database was originally initialized with Prisma schema synchronization and has no `_prisma_migrations` ledger. The additive `mustChangePassword` column was applied transactionally before release `20260717T132949Z`; do not run `prisma migrate deploy` against Sheldon until the existing schema has been formally baselined.

Initialization does not authorize a deployment, rollback, secret change, database change, or Cloudflare route change. Each live operation needs explicit authorization through the deployment skill.
