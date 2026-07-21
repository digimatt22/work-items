# Project Deliverable Sharing

## Status

Completed on 2026-07-21

## Goal

Allow an administrator to attach a project deliverable and generate a password-protected download link usable without a DigiColony account.

## Implemented Behavior

- Deliverables reuse project-linked `Asset` records and the configured storage provider.
- Only administrators can upload, create shares, or revoke shares.
- Links use a high-entropy token and separately generated password; only the bcrypt hash is stored.
- Shares expire after 7, 14, or 30 days and lock for 15 minutes after five failed passwords.
- Public download streams through the application after authorization and records successful-download evidence.
- Sheldon stores physical objects in the private Garage bucket `digicolony-client-ops`.

## Validation Evidence

- Schema migration `0006_project_deliverable_sharing` was applied transactionally without changing existing users, credentials, clients, projects, or work items.
- Unit, type, production-build, documentation-link, and formatting checks passed.
- Local browser validation passed upload, one-time share details, anonymous wrong-password rejection, correct download, download count, and revocation.
- Live Sheldon validation passed Garage upload, project attachment, share creation, anonymous wrong-password rejection, exact-byte download, and revocation against release `20260721T201007Z`.
- The live test discovered and verified a fix ensuring failure redirects use canonical `AUTH_URL` rather than container origin `0.0.0.0:3000`.
- Two S3-backed proof assets remain attached as operational evidence; both associated validation shares are revoked.
- One proof asset survived an application redeploy, and both survived a Garage restart and backup/restore drill.

## Preservation

See [Project Upload Preservation On Sheldon](project-upload-preservation.md) for the deployed Garage topology, backup checksum, restore evidence, and remaining off-server backup risk.

## Review Notes

- The repository has no configured remote, so PR review is unavailable.
- UX/UI specialist tracks were skipped because the flow reused established project and public-card patterns; responsive local browser validation passed.
- lifeOS MCP was unavailable; no lifeOS context informed this work.
