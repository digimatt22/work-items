# Sheldon 0.2 Migration Baseline

## Scope

Read-only inventory captured before changing the Work Items deployment
contract. No database, Garage, secret, Caddy, container, release, or public
deployment state was changed.

## Application And Release

- Live release: `20260724T140218Z`
- Current release symlink: matches the live release
- Source recorded by the prior deployment: `7d92fbc`
- Origin: `127.0.0.1:39732`
- Public hostname: `portal.digicolony.net`
- Network: `sheldon-digicolony-client-ops_default`, `172.30.0.0/16`
- Container user: `nextjs`
- Image ID:
  `sha256:410942f86151c8fa77f19db4a11fb3b7b90dfd0a54a3b68c8f48cc772a333eed`
- Memory limit: 2 GiB
- CPU limit: 1.5
- PID limit: absent
- Retained release directories: 14

The generated Compose file uses the server-side environment file and BuildKit
secret reference; it does not embed the environment values. The environment
file is mode `0600`.

## PostgreSQL

- Engine: PostgreSQL 17.10
- Database: `appdb`
- Runtime role: `appuser`
- Database connection limit: unbounded (`-1`)
- Role connection limit: unbounded (`-1`)
- Migration ledger: absent
- Protected counts:
  - users: 3
  - password credentials: 3
  - clients: 3
  - projects: 6
  - work items: 1
  - assets: 2
  - asset links: 2
  - deliverable shares: 2
  - project bindings: 0
  - OAuth access grants: 0

The inventory transaction applied a local five-second statement timeout and
one-second lock timeout. The server defaults remain unbounded/disabled and are
recorded as drift from the target declaration.

Existing backups:

- `pre-client-user-permissions-20260724T133857Z.dump`, mode `0600`, 84,440
  bytes, prior SHA-256
  `38919ac64d6eed231653e3ac9ea41d37309e0ff177085d94591e3701a4c9cb0f`;
- `pre-digi-portal-0004-0005-20260721T204511Z.dump`, mode `0600`, 50,845
  bytes;
- `pre-f885ac4-schema.sql`, mode `0600`, 24,147 bytes.

The latest full dump passed `pg_restore --list`; an isolated database restore
check remains required before live deployment approval.

## Garage

- Container: `sheldon-garage`
- Version: 2.2.0
- Health: one healthy node
- Current private address: `172.30.0.3`
- Published ports: none
- Bucket: `digicolony-client-ops`
- Bucket ID:
  `4dd949d32492b9f3347762300eb2b26045cf6ae77c58d433b78c480b0c3f4e6a`
- Key name: `digicolony-client-ops-app`
- Key validity: valid; cannot create buckets
- Key permissions: read/write for the Work Items bucket only
- Objects: 2
- Stored bytes: 112
- Metadata volume: `sheldon-garage-meta`
- Data volume: `sheldon-garage-data`

Existing restore evidence:

- archive `garage-20260721T201449Z.tgz`, mode `0600`, 6,917 bytes;
- SHA-256
  `3370a4a5db9a5f65eed646b68b0c9c11671d7ea93828b86c570e6c6e6ac1b03b`;
- isolated restore, bucket/key/statistics checks passed;
- temporary resources were removed.

Garage currently has only the Work Items bucket. Key metadata shows no
permissions outside it, but an actual HTTP `403` against another application's
existing bucket cannot be recorded until such a bucket is available or a
separately approved temporary isolation fixture is created.

## Public And Origin Probes

- Origin `/api/health`: `{"status":"ok"}`
- Public `/api/health`: `{"status":"ok"}`
- Origin and public Auth.js provider metadata both advertise:
  - sign-in:
    `https://portal.digicolony.net/api/auth/signin/credentials`
  - callback:
    `https://portal.digicolony.net/api/auth/callback/credentials`

The current release predates `/api/ready`, so live database/storage readiness
will be available only after an approved deployment.

## Approval Readiness Gaps

- Released and installed Sheldon Deploy 0.2.0 schema/CLI.
- Schema-2 package audit, plan, inventory, preflight, and dry-run.
- Isolated database restore check.
- Live foreign-bucket HTTP `403` evidence. A disposable Garage environment
  already proves that the Work Items key receives `403` on a real foreign
  bucket while retaining access to its own bucket.
- Exact approved live deployment and rollback targets.

## Local Candidate Evidence

- Clean implementation commit: `4091ba9`.
- A production candidate image built successfully and runs as non-root
  `nextjs`.
- The disposable readiness harness passed 19 Playwright checks, including
  canonical Auth.js URLs, administrator/client permission boundaries,
  upload/retrieval authorization, Garage own-bucket success and real
  foreign-bucket `403`, PostgreSQL/Garage outage and recovery, and bounded
  runtime limits.
- The candidate limits were 2 GiB memory, 1.5 CPU, 256 PIDs, and a 30-second
  stop grace period.
- A release-skew drill built releases A and B with one test-only stable Server
  Action key, loaded a sign-in form from A, recreated the app with B, and
  submitted the stale form successfully without a missing-action error.
- The release-skew drill explicitly recorded
  `database_downgrade=not_run`.

## Deployment Tool Compatibility Evidence

- Released plugin `0.1.0+codex.20260717125641` plan passed against schema 1.
- Released read-only preflight passed, preserving port `39732` and persisted
  subnet `172.30.0.0/16` and confirming all required environment names.
- Released status reported the expected current release, origin HTTP `200`,
  non-root `nextjs` user, and current container.
- The unreleased Phase 0 package audit rejected excluded `.env`,
  `.env.example`, `.pnpm-store`, and Next.js `next-env.d.ts` paths. This is a
  scanner false-positive blocker and not evidence that those files enter the
  release archive.
- The unreleased provisional inventory reported the missing PID limit, but
  schema-2 declarations and backup discovery were absent. It also incorrectly
  treated the valid private `172.30.0.0/16` subnet as outside policy. Do not use
  this checkout for approval until those platform defects are fixed and the
  0.2.0 contract is released.
