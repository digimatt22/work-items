# Project Upload Preservation On Sheldon

## Status

Completed on 2026-07-21

## Outcome

Project deliverables and work-item attachments on Sheldon use a private Garage v2.2.0 S3-compatible service rather than application-container storage. Garage is reusable by future Sheldon applications through separate buckets and restricted keys.

## Implemented State

- Container: `sheldon-garage`, image `dxflrs/garage:v2.2.0`.
- Exposure: no published ports; attached to `sheldon-digicolony-client-ops_default`.
- Capacity: 150 GB single-node layout on Sheldon.
- Persistence: named volumes `sheldon-garage-meta` and `sheldon-garage-data`.
- Project boundary: private bucket `digicolony-client-ops` and restricted application key.
- Application: environment-selected local/S3 storage provider with provider-aware legacy reads.
- Operations: repeatable provisioning and backup/restore scripts under `scripts/`.

## Preservation Evidence

- Baseline protected records: 2 users, 2 password credentials, 2 clients, 5 projects, and 1 work item.
- Post-rollout protected records: unchanged.
- Validation additions: 2 S3 assets and 2 revoked deliverable-share records.
- One proof object survived an application redeploy; both survived a Garage restart.
- Live flow passed upload, share creation, wrong-password rejection, exact-byte no-login download, and revocation.
- Backup `/home/mwood/sheldon/shared/garage/backups/garage-20260721T201449Z.tgz` was restored into isolated temporary volumes. Restored Garage status, bucket, key, and statistics checks passed.
- Backup SHA-256: `3370a4a5db9a5f65eed646b68b0c9c11671d7ea93828b86c570e6c6e6ac1b03b`.
- Temporary restore container, network, and volumes were removed after verification.

## Remaining Operational Risk

Garage, PostgreSQL, and their current backups remain on Sheldon. A server or disk failure can affect all copies. Matthew must approve an off-server destination, retention schedule, monitoring threshold, and recurring restore-drill cadence before treating Sheldon as the only repository for irreplaceable deliverables.

## Review Notes

- The repository has no configured remote, so PR review is unavailable.
- lifeOS MCP was unavailable; no lifeOS context informed this work.
