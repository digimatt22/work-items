# Local Development

This document covers the Phase 0 development harness for the DigiColony AI-First Client Operations Platform.

## Required Tools

- Node.js 22 or newer.
- Corepack.
- pnpm 9.15.4. Enable through Corepack with `corepack enable`.
- PostgreSQL for authenticated MVP review. Use Docker with `pnpm db:start`, or run PostgreSQL locally.

## Install

```sh
corepack enable
corepack prepare pnpm@9.15.4 --activate
pnpm install
```

## Environment

Copy the sample file and adjust values for your machine:

```sh
cp .env.example .env
```

Important variables:

- `DATABASE_URL`: PostgreSQL connection string used by Prisma.
- `AUTH_SECRET`: Auth.js local secret.
- `AUTH_TRUST_HOST`: set to `true` for local network browser review so authentication uses the request host instead of forcing a localhost callback.
- `SEED_DEFAULT_PASSWORD`: password assigned to seeded local users.
- `STORAGE_PROVIDER`: `local` by default; set to `s3` to exercise Garage or another S3-compatible service.
- `UPLOADS_DIR`: local filesystem storage root.
- `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, and `S3_FORCE_PATH_STYLE`: required together only for S3-compatible storage. Keep credentials out of the repository.
- `MCP_ISSUER`: expected MCP token issuer.
- `MCP_AUDIENCE`: expected MCP token audience.
- `DIGI_PORTAL_PLATFORM_URL`: canonical portal origin written into non-secret project binding files; HTTPS is required outside localhost.
- `DIGI_PORTAL_ADMIN_BINDINGS_ENABLED`: enables the admin-only pending-binding diagnostic surface when set to `true`.
- `DIGI_PORTAL_AGENT_READS_ENABLED`: reserves the independent read rollout gate for Phase 1 and defaults to `false`.
- `DIGI_PORTAL_AGENT_MUTATIONS_ENABLED`: guards agent claims and future write operations and defaults to `false`.

The three Digi-Portal capability flags are intentionally independent. Phase 0 may enable only admin binding diagnostics; it does not activate a binding, expose agent-readable work, or issue a connector credential.

Run local database and app commands from the repository root. Root scripts load
`.env` before invoking workspace package commands so Prisma and Next.js receive
the same local configuration.

## Commands

```sh
pnpm dev
pnpm start
pnpm lint
pnpm test
pnpm test:e2e
pnpm typecheck
pnpm prisma:generate
pnpm db:start
pnpm prisma:migrate
pnpm db:review:reset
pnpm db:seed
pnpm --filter @digicolony/db prisma:generate
```

## Dev Server Binding

The web dev server must bind to `0.0.0.0` so it is reachable from browser review surfaces and other devices on the local network. Use the root `pnpm dev` script, which delegates to `apps/web` and starts Next.js with `-H 0.0.0.0`.

Review locally at `http://localhost:3000`. For same-network device review, find
the active LAN address, then open `http://<LAN-IP>:3000`; on macOS Wi-Fi this is
usually:

```sh
ifconfig en1
```

For production-like local review, run `pnpm build` and then `pnpm start`.
The root `pnpm start` script loads `.env` before invoking Next.js production
serve, matching the local auth/database configuration used by `pnpm dev`.

Seed users:

- `admin@digicolony.local`
- `client@digicolony.local`

Both use `SEED_DEFAULT_PASSWORD`, which defaults to `ChangeMe123!` if unset.

## Phase 0 Acceptance

The harness is green when:

- dependencies install successfully;
- the Next.js app starts with `pnpm dev`;
- TypeScript lint/typecheck commands run;
- Vitest runs;
- Playwright request-level smoke tests pass;
- Prisma client generation succeeds;
- `.env.example` exists;
- this local development flow is documented.

## Digi-Portal Phase 0 Boundary

The Digi-Portal expansion's Phase 0 provides schema, migration, shared policy services, transition guards, audit/outbox persistence, non-secret config validation, and an admin-only pending-binding diagnostic page at `/integrations/digi-portal`. Binding verification and activation, OAuth grant issuance, agent queue reads, and all production agent mutations remain Phase 1 or later work.

## Basic Usage MVP Review

After Phase 1E, use [MVP Review Checklist](./MVP_REVIEW_CHECKLIST.md) for the first UI/workflow review against a live local database.

Recommended local review path:

```sh
cp .env.example .env
pnpm db:start
pnpm db:review:reset
pnpm dev
```

`pnpm db:review:reset` is destructive and intended for local MVP review only.
It resets the configured database to the Prisma schema and reseeds the clean
launch-review story so E2E-generated records do not pollute screenshots.
