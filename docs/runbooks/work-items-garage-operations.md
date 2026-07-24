# Work Items Garage Operations

## Purpose

This runbook declares Garage as a Sheldon platform dependency for Work Items.
It preserves the current storage topology and defines readiness, bucket/key
isolation, backup, restore, and approval boundaries without storing secrets.

## Preserved Identity

- Platform service: `sheldon-garage`
- Image: `dxflrs/garage:v2.2.0`
- Public ports: none
- Network: `sheldon-digicolony-client-ops-platform`,
  `10.152.101.0/24`. Treat the current container address as ephemeral.
- Bucket alias: `digicolony-client-ops`
- Bucket identifier:
  `4dd949d32492b9f3347762300eb2b26045cf6ae77c58d433b78c480b0c3f4e6a`
- Application key name: `digicolony-client-ops-app`
- Metadata volume: `sheldon-garage-meta`
- Data volume: `sheldon-garage-data`
- Configuration: mode-`0600` server file under
  `~/.config/sheldon/garage/`
- Application credentials: server-only `S3_*` names in the mode-`0600`
  Work Items environment file

Do not recreate the container, change networks, rename the bucket or key, rotate
credentials, or modify either volume as part of the project-file migration.
Each change has its own approval gate.

## Platform Dependency Contract

Schema 2 must describe Garage as an existing Sheldon-managed dependency rather
than an application-owned sidecar. Work Items may attach only to the approved
private dependency network and may not publish Garage ports through Caddy,
Cloudflare, the LAN, or the host.

The Work Items key policy is:

- read/write only to bucket `digicolony-client-ops`;
- cannot create buckets;
- no permission on any other application's bucket;
- no Garage administration or metrics credential;
- no credential values in the manifest, release archive, image, logs, or
  evidence bundle.

## Readiness

`GET /api/ready` performs a bounded S3 `HeadBucket` against the configured Work
Items bucket. It does not list or read objects. A connection, authentication,
or bucket error returns only `storage=unavailable` and HTTP `503`.

The Garage platform inventory separately checks node health, capacity, bucket
metadata, key-policy metadata, volumes, backup age, and declared/live drift.

## Read-Only Inventory Hook

Run on Sheldon:

```sh
scripts/inventory-work-items-garage-on-sheldon-remote.sh
```

The hook prints Garage status/statistics, Work Items bucket metadata, redacted
key metadata, and volume names/drivers. It does not request the secret key or
object contents.

The 2026-07-24 inventory found:

- one healthy Garage 2.2.0 node;
- 150 GB configured capacity and approximately 202.2 GB host data space
  available;
- one bucket, one application key, and two objects totaling 112 bytes;
- the Work Items key has `RW` only for the Work Items bucket and cannot create
  buckets;
- volumes `sheldon-garage-meta` and `sheldon-garage-data` use the local driver.

## Bucket Isolation Proof

Run from an approved environment that can reach Garage, has the Work Items
`S3_*` variables, and names a real bucket owned by another application:

```sh
GARAGE_DENIED_BUCKET=<other-application-bucket> \
  pnpm --filter @digicolony/db storage:verify-isolation
```

The check:

1. proves the Work Items key can reach its own bucket with `HeadBucket`;
2. attempts a one-object maximum listing against the foreign bucket;
3. passes only on an explicit HTTP `403`;
4. fails on successful foreign access, a missing/distinct-bucket error, or an
   ambiguous network failure;
5. prints only the result categories and denial status.

The repository regression test proves this fail-closed behavior. The current
live Garage inventory contains no second application bucket, so a live
foreign-bucket request cannot yet be proven without creating or selecting a
real foreign bucket. Creating a temporary bucket/key policy is a Garage
mutation and requires separate approval.

## Backup And Restore Check

`scripts/backup-and-verify-garage-on-sheldon-remote.sh` is the existing
state-changing hook. It briefly stops Garage, creates an archive and checksum,
starts Garage, restores into named temporary volumes/network/container, checks
status/bucket/key/statistics, and removes the temporary resources.

Do not run it under deployment authority. Require separate approval naming the
live stop, archive path, temporary resource prefixes, capacity check, cleanup,
and expected application impact.

Recorded evidence:

- archive: `garage-20260721T201449Z.tgz`;
- SHA-256:
  `3370a4a5db9a5f65eed646b68b0c9c11671d7ea93828b86c570e6c6e6ac1b03b`;
- mode: `0600`;
- isolated restore: passed;
- restored bucket/key/statistics: passed;
- temporary restore resources: removed.

This backup remains on the same Sheldon disk. Off-server destination,
retention, backup age alert, and recurring restore cadence remain unresolved.

## Failure Reporting

- Garage unavailable: readiness returns `503` with
  `storage=unavailable`; upload/download operations fail closed through the
  existing application error path.
- Work Items key denied on its own bucket: block deployment and investigate
  declared/live key policy. Do not rotate credentials as a diagnostic shortcut.
- Work Items key can access a foreign bucket: critical isolation failure; block
  deployment and request a separately approved key-policy correction.
- Garage restart or restore failure: leave application deployment unchanged,
  restore the live container only through the hook's trap, and inspect named
  resources before retrying.
