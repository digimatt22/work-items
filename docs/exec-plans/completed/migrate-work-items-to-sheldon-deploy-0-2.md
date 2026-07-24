# Migrate Work Items To Sheldon Deploy 0.2.1

## Status

- Status: completed
- Owner: Matthew / Codex
- Branch: `codex/sheldon-deploy-0-2-migration`
- Base: `32cc294` from `codex/client-user-permissions`; this preserves the code in live release `20260724T140218Z` and intentionally stacks on open PR #1 because `main` does not yet contain that deployed behavior
- PR: [#2](https://github.com/digimatt22/work-items/pull/2), stacked on
  `codex/client-user-permissions` while PR #1 remains open
- Last updated: 2026-07-24
- Platform plan: `social-content/docs/exec-plans/active/sheldon-platform-hardening-and-deployment-migration.md`
- Target platform contract: Sheldon Deploy 0.2.1, manifest schema 2

## Summary

- Migrate DigiColony Client Operations / Work Items from Sheldon manifest schema 1 and an implicit Garage sidecar to the enhanced schema-2 platform contract.
- Adopt exact-commit release provenance, deployment locking, bounded resources, non-root verification, retained releases, drift reporting, and explicit external PostgreSQL and Garage dependencies.
- Add database-aware and storage-aware readiness, preservation inventories, backup/restore hooks, and rollback evidence without exposing secrets.
- Preserve `portal.digicolony.net`, Auth.js public URLs, `appdb`, `appuser`, all current credentials, users, permissions, clients, projects, work items, deliverables, Garage volumes, Garage bucket identifiers, keys, and objects.
- Continue through repository changes, tests, local containers, package audit,
  plan, inventory, preflight, authorized dependency preparation, backup/restore
  verification, deployment, and live browser validation.

## Scope Boundaries

- The current PostgreSQL server remains in place. After Relay Hub leaves it, the process is treated operationally as the Work Items database instance.
- This migration did not rename `appdb` or `appuser`, rotate the existing
  runtime credential, change Garage volumes or object data, change Caddy or
  Cloudflare, or roll back.
- Application rollback never implies a database downgrade.
- Matthew authorized the dependency, secret-name, backup/restore, container,
  deployment, and live-verification gates on 2026-07-24.
- A live-approval request is not ready until protected database counts, Garage object inventory, backup and restore-check evidence, health checks, and exact rollback steps are recorded.

## Current Baseline

- Live app release: `20260724T221955Z-2fe481bb6c`, committed source
  `70e24ca05931555f6367df9dc441a75025dd0da5`, origin
  `127.0.0.1:39732`, application subnet `10.244.52.0/24`.
- Public hostname and Auth.js canonical URL: `https://portal.digicolony.net`.
- PostgreSQL: version 17 process at `172.18.0.2:5432`; database `appdb`; runtime role `appuser`; credentials unchanged and server-side only.
- Database history: the live schema was initially synchronized without a `_prisma_migrations` ledger. Migrations `0003` through `0007` were applied as separately reviewed SQL operations. Formal Prisma baselining remains required before `prisma migrate deploy`.
- Last recorded protected counts: 3 users, 3 password credentials, 3 clients, 6 projects, and 1 work item.
- Garage: `dxflrs/garage:v2.2.0`, container `sheldon-garage`, bucket `digicolony-client-ops`, key identity `digicolony-client-ops-app`, volumes `sheldon-garage-meta` and `sheldon-garage-data`.
- Last restore evidence: `garage-20260721T201449Z.tgz`, SHA-256 `3370a4a5db9a5f65eed646b68b0c9c11671d7ea93828b86c570e6c6e6ac1b03b`, isolated restore passed.
- `/api/health` checks process availability; `/api/ready` proves bounded
  PostgreSQL and Garage usability.
- lifeOS MCP is unavailable in this task; no private lifeOS context informed the migration.

## Work State

- Planned: none for this migration.
- In progress: documentation review and pull-request closeout only.
- Blocked: none.
- Needs human validation: none for deployment completion. Authenticated
  administrator/client workflows retain their existing automated candidate
  evidence; the live unauthenticated rendering and access-control smoke checks
  passed.
- Ready for review: yes.
- Completed: schema-2 implementation and validation; stable dependency network;
  scoped database identities and secret names; Garage sentinel isolation;
  protected backup and restore check; exact-source deployment; preservation
  inventory; public health/readiness/Auth.js checks; desktop/mobile rendering;
  sign-in error handling; and protected-route enforcement.

## Decisions

- Preserve the current live identity and data contracts exactly; schema 2 describes them but does not rename or recreate them.
- Declare PostgreSQL as an external, stateful `ordinary-internal` dependency with metadata only. Secret values remain in the Sheldon environment file.
- Record PostgreSQL engine/version, database and role, migration state, maximum connections, connection/statement/lock timeouts, backup hook, restore-check hook, readiness, and failure reporting.
- Declare Garage as a Sheldon platform dependency attached through an approved private network contract, not as an application-owned sidecar.
- Preserve Garage container, image, volumes, bucket, key identity, object identifiers, and credentials during the deployment migration.
- Work Items receives a unique Garage bucket/key policy. Validation must prove its key can read/write its own bucket and is denied access to another application's bucket.
- Use separate public liveness and sanitized dependency readiness endpoints.
  Neither response may contain connection strings, credential material, bucket
  credentials, object names, database error details, or customer data.
- Use exact Git commit packaging with a clean-worktree requirement and no generated artifacts unless explicitly reviewed and allowlisted.
- Require CPU, memory, and PID limits, a stop grace period, non-root user `1001`, release retention, deployment lock, source digest, image digest, and configuration drift reporting.
- Keep the application release rollback independent from schema history. Rollback selects a compatible known-healthy app release and reports database drift; it never applies down migrations.

## Approval Matrix

| Operation                                                                                             | Approval required                         | Evidence required before approval                                                                               |
| ----------------------------------------------------------------------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Read-only status, inventory, health probes, object/key policy checks, database metadata/count queries | No additional approval                    | Redacted commands; no secret values or customer content                                                         |
| Database backup or isolated restore check that changes live performance or creates server state       | Separate database-backup/restore approval | Exact command, target path/temporary resources, capacity check, cleanup plan                                    |
| Database schema migration or Prisma baseline                                                          | Separate database-migration approval      | Exact SQL/hash, protected counts, fresh backup and restore evidence, compatibility and recovery plan            |
| Garage network attachment, topology, volume, bucket policy, or key change                             | Separate Garage approval                  | Current inventory, exact affected resources, own-bucket success and foreign-bucket denial plan                  |
| Secret-file or credential change                                                                      | Separate secret-change approval           | Exact variable names or key identities; no values; rollback source                                              |
| Caddy or public route change                                                                          | Separate Caddy/route approval             | Validated config diff and route rollback                                                                        |
| Container recreation or platform dependency adoption                                                  | Separate container approval               | Image/volume/network inventory, readiness, data-preservation and recovery evidence                              |
| Public application deployment                                                                         | Separate deployment approval              | Exact commit/digest, clean package audit, plan, preflight, inventory, tests, backups, health and rollback steps |
| Application rollback                                                                                  | Separate rollback approval                | Target release/commit, database compatibility, drift report, post-rollback smoke steps                          |

## Objective Completion Audit

`Complete` means the objective has authoritative evidence at its full scope.
`Partial` means safe implementation or evidence exists, but the schema-2 or
live-approval portion remains outstanding. Nothing in this table authorizes a
live mutation.

|   # | Requirement                                                                                                                  | Status                        | Authoritative evidence or remaining proof                                                                                                                                                                                   |
| --: | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|   1 | New `codex/` branch and active plan                                                                                          | Complete                      | Branch `codex/sheldon-deploy-0-2-migration`; this active plan; schema-2 implementation commit `9613276`                                                                                                                     |
|   2 | Schema 2 and exact-commit packaging                                                                                          | Complete                      | Released 0.2.0 schema-2 manifest is parser-valid; exact commit `96132767…` produced two byte-identical 467-file audits with no generated inputs and source digest `3d36320c…`                                               |
|   3 | Preserve hostname, Auth.js URLs, accounts, credentials, permissions, projects, work items, deliverables, and objects         | Partial                       | Read-only baseline records hostname/Auth.js URLs, protected counts, Garage IDs/counts, and secret-file preservation; post-migration comparison awaits an approved deployment                                                |
|   4 | Retain current PostgreSQL, then treat it as Work Items after Relay Hub moves                                                 | Partial                       | Database runbook and interim inventory declare `rootful-shared-postgres`; Relay Hub migration is an external platform prerequisite                                                                                          |
|   5 | Keep `appdb`, `appuser`, and credentials unchanged                                                                           | Complete for repository scope | Manifest/runbooks preserve names, inventory reads are non-mutating, and no credential value or database operation changed                                                                                                   |
|   6 | Declare external stateful database metadata, migration state, limits/timeouts, backup/restore hooks, readiness, and failures | Complete for repository scope | Schema 2 declares PostgreSQL 17.10, `appdb`, `appuser`, distinct migration role, connection limit, isolation tier, revision, and readiness/backup/restore hooks; disposable hook evidence passes                            |
|   7 | Provenance, lock, bounded resources, non-root, retention, and drift                                                          | Complete for repository scope | Schema 2 declares clean exact Git source, 30-second lock, 2-GiB/1.5-CPU/256-PID limits, UID/GID 1001, five releases, and inventory; local runtime proof passes                                                              |
|   8 | Garage becomes a Sheldon platform dependency                                                                                 | Partial                       | Schema-2 Garage profile and hooks are implemented; stable-network attachment and live sentinel policy remain separately approval-gated                                                                                      |
|   9 | Preserve Garage volumes, bucket, objects, and credentials                                                                    | Partial                       | Read-only baseline records both volume names, bucket/key identity, two objects/112 bytes, and restore evidence; post-migration comparison awaits approved adoption                                                          |
|  10 | Unique Garage bucket/key and foreign-bucket denial                                                                           | Partial                       | Schema 2 preserves the unique Work Items bucket/key scope; disposable 0.2 hook proves own-bucket success and foreign-bucket HTTP `403`; live sentinel creation and proof remain Garage-approval-gated                       |
|  11 | Database/storage readiness without secret exposure                                                                           | Complete for candidate        | `/api/ready`, bounded checks, sanitized failure reporting, unit tests, and outage/recovery container tests                                                                                                                  |
|  12 | Required auth, permissions, file, outage, stale-tab, and app-only rollback tests                                             | Complete for candidate        | 70 unit tests, 19 candidate Playwright checks, Garage/PostgreSQL outage drills, explicit foreign-bucket denial, A→B stale-tab recovery, and `database_downgrade=not_run`                                                    |
|  13 | Separate approval gates                                                                                                      | Complete                      | Approval matrix plus database, Garage, and release/rollback runbooks                                                                                                                                                        |
|  14 | Commit and push each phase                                                                                                   | Complete to date              | Matthew approved publication on 2026-07-24; implementation phases through schema-2 commit `9613276` are published on `origin/codex/sheldon-deploy-0-2-migration`                                                            |
|  15 | Continue through code, docs, tests, containers, plan, preflight, inventory, and dry run                                      | Partial                       | Code/docs/containers and exact 0.2 audit/plan pass; preflight stops at its separately approved network gate and inventory hits a released defect. Version 0.2.0 has no `dry-run`; plan/preflight are its non-mutating gates |
|  16 | Stop before any live mutation                                                                                                | Complete to date              | Only read-only live inventory/status/preflight/probes ran; no database, Garage, secret, Caddy, container, release, deployment, or rollback state changed                                                                    |

## Implementation Phases

### Phase 1 — Contract and evidence scaffolding

- Convert `sheldon.json` to manifest schema 2 using the released 0.2.0 field names and validation rules.
- Add redacted database and Garage dependency declarations, ingress/network contracts, rollout policy, resource bounds, observability, and exact-source release policy.
- Add runbooks/templates for protected database counts, migration state, Garage object inventory, backup/restore evidence, readiness, drift, and rollback.
- Update project architecture, context, automations, validation, and repo map.
- Commit and push the phase.

### Phase 2 — Dependency readiness and failure reporting

- Keep `/api/health` as non-secret liveness.
- Add a dependency-readiness service and route that performs bounded PostgreSQL and Garage operations using the configured providers.
- Use explicit timeouts and sanitized component statuses.
- Verify PostgreSQL-unavailable and Garage-unavailable responses fail closed without leaking secrets.
- Commit and push the phase.

### Phase 3 — Preservation and authorization regression tests

- Test Auth.js providers and canonical generated callback URLs.
- Test administrator/client authorization, per-user movement grant and revocation behavior.
- Test upload, retrieval, share authorization, wrong password, correct bytes, and revocation.
- Test Work Items Garage access to its own bucket plus denial against a foreign bucket.
- Test stale-tab Server Action recovery and release-ID handling.
- Test app rollback compatibility without a database downgrade.
- Commit and push the phase.

### Phase 4 — Local and non-mutating deployment validation

- Run Prisma generation/format, lint, typecheck, unit tests, production build, documentation checks, and focused Playwright suites.
- Build and run production containers as non-root with bounded resources.
- Exercise dependency-ready, PostgreSQL-unavailable, Garage-unavailable, and recovery paths in local disposable services.
- Run the 0.2.0 CLI's package audit, plan, inventory, status, preflight, and dry-run modes from a clean exact commit.
- Record source commit/digest, image identity, exclusions, target hostname/origin, network/dependency plan, required environment names, drift, and rollback target without secret values.
- Commit and push the evidence phase.

### Phase 5 — Live read-only evidence and approval handoff

- Record current protected database counts and migration state.
- Record Garage bucket/key identifiers, object count/bytes/checksum inventory without object contents, volume identities, and key-policy isolation result.
- Record current backup checksums and restore-check evidence; request separate approval if a fresh backup or isolated restore would create or stop live resources.
- Record origin/public health, dependency readiness, Auth.js URL results, role/permission checks, file flow, and rollback commands.
- Stop and request explicit approvals. Do not perform live mutations.

## Validation

Planned local commands:

```sh
pnpm prisma:generate
pnpm --filter @digicolony/db prisma:format
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
scripts/check-doc-links.sh
scripts/check-inbox.sh
scripts/check-current-state.sh --full
git diff --check
```

Planned Sheldon 0.2.0 non-mutating commands:

```sh
python3 <sheldon-deploy-0.2.0>/scripts/deploy.py package-audit --project-dir .
python3 <sheldon-deploy-0.2.0>/scripts/deploy.py plan --project-dir .
python3 <sheldon-deploy-0.2.0>/scripts/deploy.py inventory --project-dir .
python3 <sheldon-deploy-0.2.0>/scripts/deploy.py status --project-dir .
python3 <sheldon-deploy-0.2.0>/scripts/deploy.py preflight --project-dir .
```

Sheldon Deploy 0.2.0 has no `dry-run` subcommand or deploy `--dry-run` flag.
`plan` and `preflight` are the released non-mutating deployment gates; this plan
records that contract gap rather than claiming an unavailable validation.

Validation results are appended here by phase with date, commit, command, result, and gaps.

### 2026-07-24 baseline and readiness implementation

- Read-only live inventory confirmed release/container/network/resource state,
  14 retained releases, PostgreSQL 17.10 metadata and protected counts, Garage
  2.2.0 health/object counts/policy/volumes, backup metadata, and canonical
  origin/public Auth.js URLs without changing live state.
- Targeted database tests passed: 12 tests, including S3 readiness and
  own-bucket/foreign-bucket fail-closed behavior.
- Targeted web tests passed: 22 tests, including dependency success,
  PostgreSQL failure, Garage failure, error sanitization, and timeout.
- Database and web TypeScript checks passed.
- Database/Garage inventory scripts passed `bash -n`.
- A bounded candidate container passed 19 Playwright checks covering canonical
  Auth.js URLs, administrator/client permission boundaries, file upload and
  retrieval authorization, own-bucket access, a real foreign-bucket HTTP
  `403`, and recovery after disposable Garage and PostgreSQL outages.
- Disposable release A and B images built with the same test-only Server Action
  key. A sign-in form loaded from A submitted safely after replacement by B;
  no missing-action/application error appeared and no database downgrade ran.
- Candidate runtime verification passed as non-root with 2 GiB memory, 1.5 CPU,
  256 PID, and 30-second stop-grace limits.
- `pnpm prisma:generate`, Prisma format, lint, typecheck, all 70 Vitest
  tests, production build, Markdown links, inbox consistency, shell syntax,
  Compose validation, `git diff --check`, and the full current-state gate
  passed.
- The repository-wide Prettier check continues to report its pre-existing
  144-file formatting baseline. Every file changed for this migration was
  formatted directly and passes `git diff --check`.
- Clean implementation commit `4091ba9` was produced from the validated source.
  The released 0.1 CLI's plan, status, and read-only preflight passed; preflight
  retained origin port `39732`, persisted subnet `172.30.0.0/16`, and confirmed
  all required environment names without printing their values.
- An initial canonical 0.1.1 audit from the developer working tree correctly
  rejected the ignored local `.env` and also exposed tracked inputs that were
  incompatible with its strict release policy. The application-side follow-up
  below removed those committed blockers.
- Package-safety follow-up moved the tracked local configuration example to
  `config/local-development.example`, stopped tracking generated
  `apps/web/next-env.d.ts`, and generates the test-only Server Action key in a
  mode-`0600` temporary file. This keeps generated environment/type files and
  the test key out of exact-commit release source.
- The supported schema-1 migration-window inventory now declares the target
  2-GiB/1.5-CPU/256-PID budget, five-release retention, preserved Garage
  volumes, backup owner/age policy, `appdb`/`appuser` ordinary-internal
  database identity, and the owned Garage dependency without secret values.
- Canonical 0.1.1 package audit passed twice with byte-identical output from a
  clean clone of `2c57972ea70d1657a4b8fd8fb40e6c6f20eefb3a`: 463 committed
  files, zero generated inputs, source digest
  `11fb9fc0efb621303e712adb1d7a9a05aa1516f2e68db792bd1ec8843c769027`,
  and manifest digest
  `62d68a1ef1a24ecddd18e5afeb590aa9ab7a53060bd420a00e4f67f49368c33a`.
  Neither the Server Action key fixture nor `next-env.d.ts` was present.
- Exact-commit 0.1.1 preflight passed and preserved live port `39732`, subnet
  `172.30.0.0/16`, and all required environment names. Inventory read the new
  database/storage declarations and reported genuine PID/resource, retention,
  backup-evidence, and host dependency-metadata drift.
- Inventory also produced two known platform defects: it rejects the preserved
  private `/16` network under its narrower `/20`–`/28` policy, and packaged
  baseline name `work-items` causes the collector to compare
  `digicolony-client-ops` with itself as though it shared `appdb`/`appuser`.
  The read-only database inventory contradicts that self-sharing inference;
  neither finding authorizes a topology or identity change.
- Current gaps: released 0.2.0 manifest validator and exact schema contract,
  isolated PostgreSQL restore evidence for the latest full live dump, live
  foreign-bucket `403` evidence, exact-commit 0.2.0 package
  audit/plan/inventory/preflight/dry-run, and final live approval.

### 2026-07-24 platform Phase 2 check

- The canonical platform branch committed schema-2 Phase 2 as `d815a54` after
  the application audit. Its 39 deployment tests and source package validation
  pass.
- The draft explicitly rejects any non-null `database` declaration and any
  non-empty `storage` declaration, deferring both dependency profiles to
  platform Phase 4. It also has no `dry-run` command.
- Work Items cannot adopt that narrower draft without violating the requested
  external PostgreSQL and declared Garage dependency contract. The application
  manifest therefore remains on the supported schema-1 migration-window
  declaration until a committed, reviewed, released contract covers those
  requirements.
- Matthew approved release publication and application deployment on
  2026-07-24. The branch was pushed successfully. Deployment was not started
  because the schema-2 contract cannot yet preserve the required PostgreSQL and
  Garage declarations, no dry-run command exists, and isolated PostgreSQL
  restore evidence remains separately approval-gated.

### 2026-07-24 released 0.2.0 adoption

- Canonical Sheldon Deploy source is clean at release commit
  `3213a091718177bcbf2fed69fd91bb72dacca322`; its plugin manifest reports
  version `0.2.0`.
- `sheldon.json` now passes the released schema-2 parser and declares exact Git
  source, public ingress, UID/GID 1001, bounded resources, rollout locking and
  retention, external PostgreSQL metadata/hooks, and the Garage platform
  dependency without secret values.
- The production image includes Node.js plus PostgreSQL 17 client/server tools
  so the same immutable non-root image can execute readiness, streaming backup,
  and isolated restore-check hooks.
- The full disposable container harness passed all 70 unit tests and 19
  Playwright tests, PostgreSQL and Garage readiness hooks, own-bucket access,
  real foreign-bucket HTTP `403`, a complete `sheldon-envelope-v1` backup,
  network-disabled/read-only-root restore verification with protected counts,
  PostgreSQL/Garage outage and recovery, Auth.js, administrator/client
  boundaries, file flows, and non-root resource limits.
- Local plan parsing reached release-source validation and correctly rejected
  ignored local `.env` and `.pnpm-store/v11/index.db` artifacts. Exact release
  audit and plan therefore run from a clean clone after this phase is committed.
- Remaining live prerequisites are unchanged and separately approved: create
  or verify the distinct migration identity and runtime connection limit, add
  the two scoped database URL secret names without rotating current
  credentials, provision the stable dependency network, attach the preserved
  Garage service and create the foreign sentinel policy, run a fresh protected
  backup/restore check, then separately approve container/deployment changes.
- Canonical 0.2.0 `package-audit` passed twice with byte-identical JSON for
  exact commit `96132767d3cf98e3d252a037de3e3dcbbd3937f5`: 467 committed files,
  zero generated inputs, source digest
  `3d36320c6cc6c6e91ccf534c62cd8c328e395b474b829845e60d22d1c2c7252e`,
  and manifest digest
  `a12cfe4c7aecd2d770c38d6411c37223f2dcf1ec99e8221018b3a78efdc26368`.
- The exact 0.2.0 plan preserves `portal.digicolony.net`, loopback origin
  `127.0.0.1:39732`, `/api/health`, PostgreSQL/Garage identities, and all
  secret names without values. It proposes application subnet
  `10.244.52.0/24` and platform subnet `10.152.101.0/24`; creating or switching
  either network is not authorized by this evidence.
- Read-only preflight stopped because
  `sheldon-digicolony-client-ops-platform` does not exist. This is the expected
  separate `dependency-network-provision` gate; no network was created.
- Released 0.2.0 status cannot fully inspect this schema-1 live release because
  the deployed Compose service is named `app` while schema 2 requires `web`.
  Origin `/api/health` still returned HTTP 200 before the service lookup failed.
- Released 0.2.0 inventory has a platform defect in
  `remote_inventory.py`: `managed_volume_inventory()` calls undefined helper
  `output()` instead of the existing read-only `command()` helper. The
  authoritative 0.2 inventory command therefore exits before producing JSON.
  Existing read-only database/Garage baseline evidence remains valid, but this
  platform defect must be fixed and released before inventory can become a
  green deployment gate.
- A diagnostic-only run with the concurrently prepared, unreleased 0.2.1
  one-line collector fix completed read-only. It reconfirmed release
  `20260724T140218Z`, origin HTTP 200, loopback port `39732`, non-root user
  `nextjs`, 2-GiB/1.5-CPU limits, missing PID limit, 14 retained releases, and
  the preserved `172.30.0.0/16` network. It also correctly reports missing
  schema-2 backup/restore and dependency metadata. The packaged baseline still
  produces the known false self-sharing `work-items` database/role finding.
  Diagnostic output does not replace a released inventory gate.

### 2026-07-24 released 0.2.1 deployment attempt

- The installed Sheldon Deploy plugin reports version `0.2.1`; the bundled
  schema-2 plan and package audit pass from a clean temporary clone of exact
  commit `74cda4e0724fad96a332fc18f8a4e1a6695f101b`.
- The audit records 467 committed files, zero generated inputs, source digest
  `a72c6e3c7c45baee1b05132bb8bc99550d0265e0533b2873480741c48c781bd5`,
  and unchanged manifest digest
  `a12cfe4c7aecd2d770c38d6411c37223f2dcf1ec99e8221018b3a78efdc26368`.
  The ordinary checkout remains intentionally unpackagable because its ignored
  `.env` and `.pnpm-store/v11/index.db` are prohibited release inputs; neither
  file was removed or uploaded.
- Local lint, typecheck, all 70 unit tests, and the production build pass. An
  exact-commit Docker `runner` image built successfully, runs as non-root user
  `nextjs` (UID/GID 1001 in the image), listens on `0.0.0.0:3000`, and returns
  `{"status":"ok"}` from `/api/health`.
- Released 0.2.1 inventory now completes, resolving the 0.2.0 collector defect.
  It observes live release `20260724T140218Z`, origin HTTP 200, loopback port
  39732, non-root `nextjs`, 2-GiB memory and 1.5-CPU limits, no PID limit, the
  preserved `172.30.0.0/16` network, and 14 retained releases.
- Inventory reports five critical, six error, and four warning findings. The
  schema-1-to-schema-2 transition explains the missing `web` service, resource
  drift, absent schema-2 dependency metadata, and absent plugin-managed
  backup/restore evidence. The reported `shared-database` and
  `shared-runtime-role` collision with platform application `work-items` is a
  false self-collision: the packaged baseline's `work-items` record is the
  preserved database/storage contract for this `digicolony-client-ops`
  application.
- Released status reaches the healthy origin but cannot find service `web`
  because the current schema-1 Compose service is `app`. Dependency check and
  preflight both stop because stable network
  `sheldon-digicolony-client-ops-platform` is absent.
- No deploy, network provisioning, database operation, Garage mutation, secret
  change, backup, restore check, release cleanup, Caddy change, or Cloudflare
  change was run. The next live step requires separate approval to provision
  the declared stable dependency network, followed by refreshed preflight and
  the other existing database/storage/backup authority gates.

### 2026-07-24 authorized 0.2.1 live migration

- Matthew authorized all required deployment and live-verification steps.
- Provisioned owned stable dependency network
  `sheldon-digicolony-client-ops-platform` at `10.152.101.0/24`, attached the
  portal and preserved Garage container, and verified database/storage
  readiness throughout the zero-downtime detach from legacy network
  `172.30.0.0/16`.
- Removed the empty legacy network and persisted allocated application subnet
  `10.244.52.0/24`.
- Added the scoped migration and backup URL names to the canonical mode-`0600`
  environment file without rotating the runtime credential. Created
  non-superuser migration and backup roles and limited runtime role `appuser`
  to 10 connections.
- Created an empty foreign Garage sentinel with no application key. Live
  dependency checks passed database readiness, Work Items bucket readiness,
  and foreign-bucket denial.
- Protected backup and isolated restore check passed with SHA-256
  `4ccf2efff322f252dd2f4f62c2d980655fa7e5e86f2c5db7de7fc1c75cb4e7a6`.
- Final exact-source package audit and plan passed for
  `70e24ca05931555f6367df9dc441a75025dd0da5`: 467 committed files, source
  digest
  `c02971d967b72dbc6fafb7c5bc84bda46fdccd28a32f2b3627812d3297e03272`,
  and manifest digest
  `a12cfe4c7aecd2d770c38d6411c37223f2dcf1ec99e8221018b3a78efdc26368`.
- Preflight passed with origin port 39732, allocated application subnet,
  owned platform network, and every required environment name present.
- Sheldon promoted release `20260724T221955Z-2fe481bb6c`. Status confirmed
  origin HTTP 200, runtime user `1001:1001`, 2-GiB memory, 1.5 CPU, 256 PIDs,
  no mounts, and no image-declared volumes.
- Public `/api/health` and `/api/ready` returned HTTP 200. Auth.js advertised
  canonical HTTPS URLs. Browser checks passed desktop and 390x844 rendering
  without horizontal overflow, invalid-credential feedback, and
  unauthenticated redirect from `/work-items` to `/sign-in`; browser logs had
  no warnings or errors.
- Protected counts remained 3 users, 3 password credentials, 3 clients, 6
  projects, 1 work item, 2 assets, 2 asset links, 2 deliverable shares, 0
  project bindings, and 0 OAuth access grants.
- Final inventory removed the invalid-subnet and unmanaged-volume findings.
  Remaining non-blocking findings are the packaged `work-items` self-alias,
  shared cluster failure domain, and release retention of 20 versus 5.
- Full evidence:
  [Sheldon 0.2.1 Live Migration](../../deployments/sheldon-0-2-1-live-migration-2026-07-24.md).

## Human Validation

- Owner: Matthew or delegated reviewer.
- Status: deployment validation complete.
- Evidence: exact release provenance, protected-count comparison, Garage
  isolation, backup/restore result, readiness, browser rendering and
  interaction checks, and rollback procedure are recorded in this plan and the
  linked live migration evidence.
- Blocks merge: no.

## Documentation

- Update `SHELDON_DEPLOY.md`, `server-configuration-report.md`, `docs/PROJECT_CONTEXT.md`, `docs/ARCHITECTURE.md`, `docs/AUTOMATIONS.md`, `docs/VALIDATION.md`, and `docs/REPO_MAP.md`.
- Add focused database, Garage, readiness, inventory, and rollback runbooks under `docs/runbooks/`.
- This plan is archived under `docs/exec-plans/completed/`.

## Closeout

- Final status: completed and ready for review. Schema-2 release
  `20260724T221955Z-2fe481bb6c` is live and verified.
- Merge or abandonment notes: merge through the branch pull-request workflow.
- Follow-up work items: formal Prisma migration baseline; off-server Garage backup target/retention; Relay Hub move from the shared PostgreSQL process; separately reviewed database role hardening if desired later.
