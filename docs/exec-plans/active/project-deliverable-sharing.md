# Project Deliverable Sharing

## Status

Needs human validation

## Owner

Codex, with Matthew as product approver and human validation owner.

## Branch

`codex/project-deliverable-sharing`

## Goal

Allow an administrator to upload a project deliverable and create a password-protected public download link that a client can use without a DigiColony account.

## Decisions And Assumptions

- Project deliverables reuse the existing `Asset` and storage-provider abstractions and are linked directly to one project.
- Only administrators can upload deliverables, create links, or revoke links.
- A share stores a high-entropy public token and a bcrypt password hash. The generated password is shown only when the link is created.
- New links expire after 14 days by default; the administrator may choose 7 or 30 days.
- Five failed password attempts lock a share for 15 minutes. Errors do not disclose whether the link or password was valid.
- A public link grants download access to one file only. It does not create a client session or expose other project data.
- The existing local storage provider remains the implementation for this pass. Durable object storage remains required before relying on this flow for external production delivery.
- UX, UI-system, and interaction specialist tracks were considered and skipped because this is a bounded extension using established project panels, forms, upload constraints, and public-card patterns. Human responsive/design QA remains required.

## Implementation

- [x] Add the share-link schema and migration.
- [x] Add shared deliverable contracts, authorization rules, validation, and tests.
- [x] Add Prisma-backed deliverable storage, share management, lockout, and audit behavior.
- [x] Add project workspace upload/share/revoke UI.
- [x] Add the public password and download routes without login requirements.
- [x] Update product, architecture, and operational documentation.
- [x] Run database, type, unit, build, and documentation validation.

## Acceptance Criteria

- An admin can upload an allowed file against a project.
- An admin can create a 7-, 14-, or 30-day share and receives its URL and generated password.
- The password is never persisted in plaintext and cannot be retrieved later.
- An unauthenticated visitor can download only the linked file after submitting the correct password.
- Expired, revoked, locked, unknown, and incorrect-password requests fail with a generic response.
- Five failed attempts lock the share for 15 minutes; a successful download resets failed attempts and increments download evidence.
- An admin can revoke an active link, after which it cannot download the file.
- Upload, share creation, revocation, and successful download are recorded as activity events without recording secrets.
- Existing work-item attachment behavior remains unchanged.

## Validation

- `pnpm prisma:generate`
- `pnpm --filter @digicolony/db prisma:format`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `scripts/check-doc-links.sh`
- `scripts/check-inbox.sh`
- `git diff --check`

Completed 2026-07-21:

- Prisma formatted/generated successfully, and migration `0006_project_deliverable_sharing` applied successfully to the confirmed localhost development database without changing existing records.
- `pnpm typecheck` passed across all workspace packages.
- `pnpm test` passed; the final suite contains 47 tests, including project-deliverable authorization/audit and password-lockout coverage.
- `pnpm build` passed and included the new public page and download route.
- Markdown link, inbox, and diff checks passed.
- In-app browser validation at the local development URL passed upload, share generation, signed-out public access, wrong-password rejection, successful download, download count, revocation, and revoked-link failure. The test asset/share and physical test file were removed afterward.
- Desktop and 390 × 844 reviews showed no computed horizontal overflow for the project-deliverable controls or public delivery card. The public card and all new mobile controls remained within their containers.
- Sheldon migration and deployment completed on 2026-07-21 as release `20260721T184200Z`. Origin/public health and canonical Auth.js URLs passed; live preservation counts remained 2 users, 2 password credentials, 2 clients, 5 projects, and 1 work item. The new share table and current asset inventory were empty.
- Important production-like deliverables remain blocked on `docs/exec-plans/active/project-upload-preservation.md` because the current container has no `/app/uploads` mount.

## Human Validation

- Owner: Matthew
- Steps: upload a representative project deliverable, create a share, open it in a private browser, verify a wrong password fails, verify the generated password downloads the correct file, then revoke the link and verify it stops working.
- Expected evidence: screenshots of the admin share state and public download screen plus confirmation that the downloaded file matches the uploaded file.
- Status: pending for a representative real deliverable and deployment-like environment

## Review And Closeout

- No `origin` remote is configured, so PR creation and remote review are not available.
- Keep this plan active as `needs human validation` after automated checks pass.
- lifeOS MCP is not available in this session; no lifeOS context informed this work.
