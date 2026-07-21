# Project Upload Preservation On Sheldon

## Status

Planned — required before the first important client deliverable is uploaded

## Owner

Codex for implementation; Matthew for retention schedule and restore-drill approval.

## Goal

Preserve project deliverables and work-item attachments across Sheldon deployments and rollbacks while continuing to use the current local-filesystem `StorageProvider`.

## Current-State Evidence

- Release `20260721T184200Z` runs as user `nextjs` on `127.0.0.1:39732` with the persisted `172.30.0.0/16` application network.
- PostgreSQL is already persistent outside application releases. The post-deploy baseline is 2 users, 2 password credentials, 2 clients, 5 projects, 1 work item, 0 assets, and 0 deliverable shares.
- `UPLOADS_DIR` currently defaults to `/app/uploads` in the container.
- The current Compose release has no mounts. `/app/uploads` is erased whenever the application container is replaced.
- Release archives intentionally exclude `uploads/`, `.env*`, and generated output.
- Because the asset and physical-file counts are both zero, no upload copy or reconciliation is required before introducing the persistent mount.

## Decision

Use one rootless-Docker named volume, scoped to `digicolony-client-ops`, mounted at `/app/uploads`. Keep the existing local storage provider and object-key layout unchanged. Add persistence as a supported Sheldon deployment-manifest capability rather than hand-editing a generated release Compose file.

Recommended volume identity: `sheldon-digicolony-client-ops-uploads`.

Set `UPLOADS_DIR=/app/uploads` explicitly in Sheldon configuration even though it is currently the application default. The deployment preflight must fail when the declared persistent mount is absent.

## Implementation Plan

### Phase 1: Persistent Runtime Storage

1. Extend the Sheldon deployment plugin manifest and generator with a narrowly scoped persistent-path declaration.
2. Generate a named-volume mount for `/app/uploads` in every new release and rollback Compose file.
3. Preserve the named volume when releases or containers are replaced; deployment and rollback must never run volume-removal operations.
4. Add `UPLOADS_DIR` to the required Sheldon environment names and set it server-side to `/app/uploads` without exposing other environment values.
5. Add a preflight assertion that the running container has the expected mount and that user `nextjs` can create, read, and remove a probe file.
6. Deploy before any real client deliverable is uploaded.

### Phase 2: Backup And Reconciliation

1. Create an encrypted or mode-`0600` server-side backup location outside release directories.
2. Snapshot the upload volume with a read-only helper container; never copy uploads into a release archive.
3. Coordinate the upload-volume snapshot with a PostgreSQL backup or asset-metadata export so object keys and database records can be restored together.
4. Add a reconciliation command that checks every active `Asset.objectKey` exists under the mounted volume and verifies stored checksums when available.
5. Run reconciliation before deployment, after deployment, after rollback, and after restore. Deployment must stop on missing objects rather than silently publishing broken links.
6. Record backup cadence and retention only after Matthew approves them. Recommendation for the development server: nightly backups plus a pre-deploy backup, with a bounded daily/weekly retention policy sized against actual upload volume.

### Phase 3: Restore Proof

1. Restore a backup into a separate temporary volume.
2. Run the reconciliation command against a database snapshot or exported asset inventory.
3. Start a disposable application container against the restored volume and verify an authenticated attachment plus a password-protected deliverable download.
4. Record the restore duration, evidence, and any missing operational steps.
5. Repeat on an approved schedule; schedule is `TBD` pending Matthew's decision.

### Future Production Path

Move physical objects to S3-compatible storage with versioning, lifecycle rules, and independent backup once the external-production requirements justify it. The `Asset.objectKey` and `StorageProvider` boundaries allow that change without replacing the deliverable-sharing domain model.

## Acceptance Criteria

- The application container reports a persistent mount at `/app/uploads` and still runs as `nextjs`.
- A test upload survives a normal redeploy and rollback.
- Database user, password-credential, client, project, and work-item counts remain unchanged during storage rollout.
- Every asset metadata record has a physical object; reconciliation reports zero missing or unexpected objects for the test fixture.
- A backup can be restored into a clean temporary volume and the restored file checksum matches the source.
- Deployment fails safely if the mount, write access, backup prerequisite, or reconciliation check is missing.
- Secrets and plaintext share passwords never enter upload backups, manifests, release archives, or logs.

## Risks And Controls

- **Named-volume deletion:** never use Compose volume-removal flags; keep volume identity stable across releases.
- **Metadata/file drift:** make reconciliation a deployment gate and preserve database plus file snapshots as one recovery set.
- **Rootless ownership mismatch:** verify read/write behavior as container user `nextjs`, not only as the SSH user.
- **Disk exhaustion:** monitor volume and backup-directory usage; define an alert threshold before enabling large client uploads.
- **Unproven backups:** a successful archive is not sufficient; require a temporary-volume restore drill.
- **Current exposure:** until Phase 1 is complete, do not rely on Sheldon for important client deliverables because the next deployment will remove container-local files.

## Validation

- Sheldon plugin tests for manifest validation, Compose generation, deploy, and rollback volume preservation.
- Non-mutating deployment plan and remote preflight.
- Live mount inspection and `nextjs` write/read/delete probe.
- Upload → redeploy → download test.
- Rollback → download test.
- Backup → temporary-volume restore → checksum and download test.
- Pre- and post-change database preservation counts.

## Review And Closeout

- Keep this plan active until persistence, backup, reconciliation, and restore evidence are complete.
- The repository still has no configured remote, so PR review remains unavailable until a remote is added.
- lifeOS MCP is unavailable in this session; no lifeOS context informed this plan.
