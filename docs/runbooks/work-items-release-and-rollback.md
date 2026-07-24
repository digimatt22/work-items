# Work Items Release And Rollback

## Stable Contract

- Public hostname: `portal.digicolony.net`
- Auth.js URL: `https://portal.digicolony.net`
- Loopback origin port: `39732` unless a reviewed schema-2 plan reports a
  preserved allocation
- Application network: existing `172.30.0.0/16`
- Container runtime user: numeric UID/GID `1001`, non-root
- Liveness: `/api/health`
- Dependency readiness: `/api/ready`
- Database and storage identities: preserved as documented in the database and
  Garage runbooks

## Exact-Source Release

The release candidate must be a clean Git commit. The 0.2.0 package audit must
record:

- full source commit SHA;
- deterministic source-file inventory and SHA-256 digest;
- manifest digest;
- plugin version;
- image digest after build;
- allowed generated artifacts, normally none;
- excluded and prohibited paths;
- build time as metadata, not a source-digest input.

The package operation must reject dirty tracked files, unreviewed generated
files, symlinks, `.env*`, backups, database dumps, credentials, private keys,
dependencies, build output, uploads, and browser/test output.

## Rollout Policy

- one per-application deployment lock;
- one public web service;
- loopback-only host binding;
- memory limit 2 GiB;
- CPU limit 1.5;
- PID limit 256;
- stop grace period 30 seconds;
- initialization process enabled;
- restart policy `unless-stopped`;
- readiness deadline 120 seconds;
- retain the current release plus four prior healthy releases;
- verify non-root runtime, source/image provenance, dependencies, liveness,
  readiness, Caddy config, and declared/live drift before traffic switch.

The live 2026-07-24 inventory found no PID limit and 14 retained releases. Both
are schema-2 rollout drift. Cleanup of old releases is destructive and remains
separately approved.

## Pre-Deployment Evidence

Before requesting deployment approval, record:

1. clean current-state gate and exact commit;
2. package audit and source digest;
3. lint, typecheck, unit, production build, and focused browser results;
4. local container non-root and resource-limit checks;
5. schema-2 plan, inventory, status, preflight, and dry-run;
6. protected database counts and migration state;
7. database backup and isolated restore-check evidence;
8. Garage object count/bytes, bucket/key policy, volumes, backup/restore
   evidence, and foreign-bucket denial;
9. origin/public liveness, readiness, and Auth.js canonical URLs;
10. exact rollback target and compatibility statement.

## Application Rollback

Rollback is a separate live approval. It must:

1. identify the target release, full source commit, manifest digest, image
   digest, and last-known health evidence;
2. compare the target application's expected schema with the current live
   schema;
3. refuse or flag rollback when the application is not forward-compatible with
   the current schema;
4. acquire the same deployment lock;
5. switch only application/Caddy state;
6. never run Prisma migration, raw SQL, seed, restore, reset, credential
   change, or Garage topology change;
7. verify `/api/health`, `/api/ready`, Auth.js URLs, administrator login,
   client authorization, and one protected file path after the switch;
8. preserve the failed/newer release for investigation until cleanup is
   separately approved.

## Failure Cases

- Failed build or preflight: do not switch traffic.
- Failed database/storage readiness: do not switch traffic.
- Failed Caddy validation: retain current route and application.
- Failed new-release health after switch preparation: restore the prior
  application release without changing database or storage.
- Concurrent deploy/rollback: serialize under the app lock or fail safely.
- Drift in hostname, port, network, database/role, Garage bucket/key/volumes,
  secret names, resource limits, or release provenance: stop before mutation
  and report the exact non-secret field.
