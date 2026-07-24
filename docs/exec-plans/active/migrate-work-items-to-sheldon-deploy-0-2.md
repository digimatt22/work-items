# Migrate Work Items To Sheldon Deploy 0.2.0

## Status

- Status: in progress
- Owner: Matthew / Codex
- Branch: `codex/sheldon-deploy-0-2-migration`
- Base: `32cc294` from `codex/client-user-permissions`; this preserves the code in live release `20260724T140218Z` and intentionally stacks on open PR #1 because `main` does not yet contain that deployed behavior
- PR: TBD
- Last updated: 2026-07-24
- Platform plan: `social-content/docs/exec-plans/active/sheldon-platform-hardening-and-deployment-migration.md`
- Target platform contract: Sheldon Deploy 0.2.0, manifest schema 2

## Summary

- Migrate DigiColony Client Operations / Work Items from Sheldon manifest schema 1 and an implicit Garage sidecar to the enhanced schema-2 platform contract.
- Adopt exact-commit release provenance, deployment locking, bounded resources, non-root verification, retained releases, drift reporting, and explicit external PostgreSQL and Garage dependencies.
- Add database-aware and storage-aware readiness, preservation inventories, backup/restore hooks, and rollback evidence without exposing secrets.
- Preserve `portal.digicolony.net`, Auth.js public URLs, `appdb`, `appuser`, all current credentials, users, permissions, clients, projects, work items, deliverables, Garage volumes, Garage bucket identifiers, keys, and objects.
- Continue through repository changes, tests, local containers, package audit, plan, inventory, preflight, and dry-run validation. Stop immediately before any live database mutation, Garage network/volume mutation, secret change, Caddy change, container recreation, deployment, or rollback.

## Scope Boundaries

- The current PostgreSQL server remains in place. After Relay Hub leaves it, the process is treated operationally as the Work Items database instance.
- This migration does not rename `appdb` or `appuser`, rotate or alter database credentials, change the live Garage topology, recreate containers, change Caddy or Cloudflare, deploy, or roll back.
- Application rollback must never imply a database downgrade.
- Database migration, Garage topology, secrets, container recreation, deployment, and rollback are separate approval gates.
- A live-approval request is not ready until protected database counts, Garage object inventory, backup and restore-check evidence, health checks, and exact rollback steps are recorded.

## Current Baseline

- Live app release: `20260724T140218Z`, committed source `7d92fbc`, origin `127.0.0.1:39732`, application subnet `172.30.0.0/16`.
- Public hostname and Auth.js canonical URL: `https://portal.digicolony.net`.
- PostgreSQL: version 17 process at `172.18.0.2:5432`; database `appdb`; runtime role `appuser`; credentials unchanged and server-side only.
- Database history: the live schema was initially synchronized without a `_prisma_migrations` ledger. Migrations `0003` through `0007` were applied as separately reviewed SQL operations. Formal Prisma baselining remains required before `prisma migrate deploy`.
- Last recorded protected counts: 3 users, 3 password credentials, 3 clients, 6 projects, and 1 work item.
- Garage: `dxflrs/garage:v2.2.0`, container `sheldon-garage`, bucket `digicolony-client-ops`, key identity `digicolony-client-ops-app`, volumes `sheldon-garage-meta` and `sheldon-garage-data`.
- Last restore evidence: `garage-20260721T201449Z.tgz`, SHA-256 `3370a4a5db9a5f65eed646b68b0c9c11671d7ea93828b86c570e6c6e6ac1b03b`, isolated restore passed.
- Existing application health checks only process availability and does not prove PostgreSQL or Garage usability.
- lifeOS MCP is unavailable in this task; no private lifeOS context informed the migration.

## Work State

- Planned: exact-commit 0.2.0 packaging/plan/inventory/preflight evidence,
  approved live dependency preparation, live backup/restore evidence refresh,
  deployment, and post-deployment preservation checks.
- In progress: schema-2 release commit, exact-source validation, and
  non-mutating remote gates.
- Blocked: live readiness requires separate approvals for the stable dependency
  network, Garage network/sentinel policy, database role/connection-limit
  metadata, database secret-name additions, and fresh backup/restore evidence.
- Needs human validation: final live approval and any live-only checks explicitly
  listed in the evidence bundle. Administrator/client permission boundaries,
  authenticated file flow, public Auth.js callbacks, and stale-tab recovery
  now have automated candidate-release evidence.
- Ready for review: only after local and non-mutating remote validation passes and the evidence bundle is complete.
- Completed: repository instructions, platform plan, current manifest/runbook/server report, Dockerfile, Auth.js configuration, Prisma schema/migration history, Garage scripts, storage contracts, relevant tests, and current deployment evidence reviewed; current-state gate passed; migration branch created; released 0.2.0 schema/security/platform policy read; schema-2 manifest and dependency hooks implemented; full disposable schema-2 container validation passed.

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

|   # | Requirement                                                                                                                  | Status                        | Authoritative evidence or remaining proof                                                                                                                                                                                    |
| --: | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|   1 | New `codex/` branch and active plan                                                                                          | Complete                      | Branch `codex/sheldon-deploy-0-2-migration`; this active plan; local commits `445bff2`, `4091ba9`, `89a53dc`, and `2c57972`                                                                                                  |
|   2 | Schema 2 and exact-commit packaging                                                                                          | Partial                       | Released 0.2.0 schema-2 manifest is implemented and parser-valid; a new exact-commit audit follows the next implementation commit                                                                                            |
|   3 | Preserve hostname, Auth.js URLs, accounts, credentials, permissions, projects, work items, deliverables, and objects         | Partial                       | Read-only baseline records hostname/Auth.js URLs, protected counts, Garage IDs/counts, and secret-file preservation; post-migration comparison awaits an approved deployment                                                 |
|   4 | Retain current PostgreSQL, then treat it as Work Items after Relay Hub moves                                                 | Partial                       | Database runbook and interim inventory declare `rootful-shared-postgres`; Relay Hub migration is an external platform prerequisite                                                                                           |
|   5 | Keep `appdb`, `appuser`, and credentials unchanged                                                                           | Complete for repository scope | Manifest/runbooks preserve names, inventory reads are non-mutating, and no credential value or database operation changed                                                                                                    |
|   6 | Declare external stateful database metadata, migration state, limits/timeouts, backup/restore hooks, readiness, and failures | Complete for repository scope | Schema 2 declares PostgreSQL 17.10, `appdb`, `appuser`, distinct migration role, connection limit, isolation tier, revision, and readiness/backup/restore hooks; disposable hook evidence passes                             |
|   7 | Provenance, lock, bounded resources, non-root, retention, and drift                                                          | Complete for repository scope | Schema 2 declares clean exact Git source, 30-second lock, 2-GiB/1.5-CPU/256-PID limits, UID/GID 1001, five releases, and inventory; local runtime proof passes                                                               |
|   8 | Garage becomes a Sheldon platform dependency                                                                                 | Partial                       | Schema-2 Garage profile and hooks are implemented; stable-network attachment and live sentinel policy remain separately approval-gated                                                                                       |
|   9 | Preserve Garage volumes, bucket, objects, and credentials                                                                    | Partial                       | Read-only baseline records both volume names, bucket/key identity, two objects/112 bytes, and restore evidence; post-migration comparison awaits approved adoption                                                           |
|  10 | Unique Garage bucket/key and foreign-bucket denial                                                                           | Partial                       | Schema 2 preserves the unique Work Items bucket/key scope; disposable 0.2 hook proves own-bucket success and foreign-bucket HTTP `403`; live sentinel creation and proof remain Garage-approval-gated                        |
|  11 | Database/storage readiness without secret exposure                                                                           | Complete for candidate        | `/api/ready`, bounded checks, sanitized failure reporting, unit tests, and outage/recovery container tests                                                                                                                   |
|  12 | Required auth, permissions, file, outage, stale-tab, and app-only rollback tests                                             | Complete for candidate        | 70 unit tests, 19 candidate Playwright checks, Garage/PostgreSQL outage drills, explicit foreign-bucket denial, A→B stale-tab recovery, and `database_downgrade=not_run`                                                     |
|  13 | Separate approval gates                                                                                                      | Complete                      | Approval matrix plus database, Garage, and release/rollback runbooks                                                                                                                                                         |
|  14 | Commit and push each phase                                                                                                   | Complete to date              | Matthew approved publication on 2026-07-24; all current phase commits through `ef572af` are published on `origin/codex/sheldon-deploy-0-2-migration`                                                                         |
|  15 | Continue through code, docs, tests, containers, plan, preflight, inventory, and dry run                                      | Partial                       | Schema-2 code/docs and disposable containers pass; exact-commit 0.2 audit/plan/inventory/preflight follow this commit. Released 0.2.0 exposes no `dry-run` command; plan plus preflight are its supported non-mutating gates |
|  16 | Stop before any live mutation                                                                                                | Complete to date              | Only read-only live inventory/status/preflight/probes ran; no database, Garage, secret, Caddy, container, release, deployment, or rollback state changed                                                                     |

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

## Human Validation

- Owner: Matthew or delegated reviewer.
- Exact steps: review the final evidence bundle; verify the live administrator and client permission paths; verify Auth.js public sign-in/callback URLs; verify one authorized file flow and one denied flow; review stale-tab recovery; approve each live operation separately.
- Expected evidence: screenshots or redacted command output, protected-count comparison, Garage inventory and cross-bucket denial, backup/restore result, readiness results, exact release provenance, and rollback commands.
- Evidence location: this plan and linked review artifacts.
- Blocks merge: live approval does not block review of local implementation, but it blocks every live mutation and final migration completion.

## Documentation

- Update `SHELDON_DEPLOY.md`, `server-configuration-report.md`, `docs/PROJECT_CONTEXT.md`, `docs/ARCHITECTURE.md`, `docs/AUTOMATIONS.md`, `docs/VALIDATION.md`, and `docs/REPO_MAP.md`.
- Add focused database, Garage, readiness, inventory, and rollback runbooks under `docs/runbooks/`.
- Move this plan to `docs/exec-plans/completed/` only after the reviewed live migration is complete or the work is intentionally superseded.

## Closeout

- Final status: in progress; local schema-2 implementation passes and exact
  release validation is next. Live dependency preparation remains separately
  approval-gated.
- Merge or abandonment notes: TBD.
- Follow-up work items: formal Prisma migration baseline; off-server Garage backup target/retention; Relay Hub move from the shared PostgreSQL process; separately reviewed database role hardening if desired later.
