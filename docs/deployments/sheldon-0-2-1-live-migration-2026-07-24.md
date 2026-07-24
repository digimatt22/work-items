# Sheldon 0.2.1 Live Migration

## Release

- Public URL: `https://portal.digicolony.net`
- Sheldon release: `20260724T221955Z-2fe481bb6c`
- Source commit:
  `70e24ca05931555f6367df9dc441a75025dd0da5`
- Source digest:
  `c02971d967b72dbc6fafb7c5bc84bda46fdccd28a32f2b3627812d3297e03272`
- Manifest digest:
  `a12cfe4c7aecd2d770c38d6411c37223f2dcf1ec99e8221018b3a78efdc26368`
- Package: 467 committed files, no generated inputs
- Origin: `127.0.0.1:39732`
- Application network:
  `sheldon-digicolony-client-ops_default`, `10.244.52.0/24`
- Stable dependency network:
  `sheldon-digicolony-client-ops-platform`, `10.152.101.0/24`

Sheldon Deploy 0.2.1 package audit, plan, and preflight passed from a clean
detached checkout of the exact commit. The deployment built the production
image, ran the image's 22 unit tests, checked the candidate, promoted it, and
returned HTTP 200 from the origin.

## Dependency Preparation And Recovery

- Garage and the portal were attached to the stable dependency network before
  the legacy `172.30.0.0/16` network was removed. `/api/ready` stayed green
  after each detach, so the migration did not interrupt database or storage
  access.
- The persisted application subnet is now `10.244.52.0/24`.
- The canonical mode-`0600` environment file contains separate
  `DATABASE_URL`, `DATABASE_MIGRATION_URL`, and `DATABASE_BACKUP_URL` names.
  Secret values were not recorded.
- PostgreSQL roles `appuser_migrator` and `appuser_backup` exist without
  superuser or role-creation authority. Runtime role `appuser` has a
  connection limit of 10. Its legacy superuser/role-creation attributes remain
  a separately reviewed hardening follow-up.
- The Garage bucket sentinel `work-items-foreign-sentinel` has no application
  key attached. The Work Items key retained read/write access only to
  `digicolony-client-ops` and received HTTP 403 against the sentinel.
- The pre-deployment protected backup and isolated restore check passed with
  SHA-256
  `4ccf2efff322f252dd2f4f62c2d980655fa7e5e86f2c5db7de7fc1c75cb4e7a6`.

## Post-Deployment Verification

- Sheldon status: origin HTTP 200, container user `1001:1001`.
- Runtime limits: 2 GiB memory, 1.5 CPU, 256 PIDs.
- Runtime mounts: none.
- Image-declared volumes: none.
- Dependency checks:
  - database: healthy
  - storage `work-items-private`: healthy
  - storage isolation `work-items-private`: healthy
- Public `/api/health`: HTTP 200, `{"status":"ok"}`.
- Public `/api/ready`: HTTP 200 with database and storage both `ok`.
- Auth.js provider metadata advertises public HTTPS sign-in and callback URLs.
- A real browser rendered the sign-in page at the default desktop viewport and
  at `390x844`. Mobile layout had no horizontal overflow.
- Browser interaction confirmed that invalid credentials return the expected
  inline error and that `/work-items` redirects an unauthenticated visitor to
  `/sign-in`. No browser console warnings or errors were recorded.
- Protected database counts remained unchanged: 3 users, 3 password
  credentials, 3 clients, 6 projects, 1 work item, 2 assets, 2 asset links, 2
  deliverable shares, 0 project bindings, and 0 OAuth access grants.

The final Sheldon inventory no longer reports the invalid legacy subnet or an
unmanaged anonymous PostgreSQL volume.

## Remaining Non-Blocking Drift

- Twenty release directories exceed the declared retention of five. Cleanup is
  destructive and remains a separately reviewed operation.
- The packaged platform baseline still aliases this application as
  `work-items`, producing false self-comparison findings for the `appdb`
  database and `appuser` role.
- The PostgreSQL process remains a shared failure domain with Relay Hub until
  its separate platform migration is complete.

## Sheldon Deploy 0.2.1 Compatibility Notes

Two released CLI defects were encountered during the authorized deployment:

- Docker networks with `"IPAM": {"Config": null}` caused the remote dependency
  network reader to fail.
- Remote `docker compose` commands inherited the streamed deployment script on
  standard input, consuming later script lines before promotion.

The deployment used a temporary local copy of the 0.2.1 plugin with null-IPAM
normalization and `docker compose` standard input redirected from `/dev/null`.
All 82 bundled plugin tests passed after those compatibility fixes. No plugin
source in this repository or on Sheldon was modified.
