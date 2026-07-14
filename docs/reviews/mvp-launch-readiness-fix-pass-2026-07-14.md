# MVP Launch Readiness Fix Pass Review

Date: 2026-07-14

Status: ready for Matthew human validation; PR setup still blocked by missing `origin` remote

## Evidence

- Source review: `docs/reviews/mvp-launch-readiness-2026-07-14.md`
- Current screen/action inventory: `docs/reviews/mvp-launch-current-screen-action-inventory-2026-07-14.md`
- Human validation checklist: `docs/reviews/mvp-launch-human-validation-checklist-2026-07-14.md`
- PR review notes: `docs/reviews/mvp-launch-pr-review-notes-2026-07-14.md`
- Post-fix dev screenshots: `docs/reviews/screenshots/mvp-launch-readiness-fix-pass-2026-07-14/`
- Production-like screenshots: `docs/reviews/screenshots/mvp-launch-readiness-production-2026-07-14/`
- Production-like capture command: `SCREENSHOT_DIR=docs/reviews/screenshots/mvp-launch-readiness-production-2026-07-14 node scripts/capture-launch-readiness-screenshots.mjs`
- Git evidence: local baseline commit exists on `main`; remote/PR setup is still blocked until `origin` is configured.

## Fixes Verified

- Clean local review reset exists as `pnpm db:review:reset`.
- Review seed data now contains a clean launch-readiness story instead of accumulated E2E records.
- Client users only see work items they created or reported.
- Client users are redirected away from `/clients`, `/clients/[clientId]`, and `/projects/[projectId]` into the request board.
- Client work item detail no longer exposes admin-only operational summary language.
- Client work item detail now uses client-facing request language instead of internal work-record/user-story labels.
- Client board and request detail now explain status meaning for client users.
- Client board copy now reads as request tracking instead of internal work management.
- Client detail project cards now show project names and descriptions in the closed/read state for admins.
- Mobile board now includes a status jump bar above columns.
- Work item upload controls now show allowed extensions and the 100 MB max file size before selection.
- Client work item detail now has automated live validation for comments with mentions, blocked file-type upload errors, and allowed asset attachment.
- Production-like screenshots do not show the dev overlay/issue badge.

## Remaining Launch Checks

- Matthew should review the production-like screenshots and run the app manually as both admin and client.
- Matthew should record final go/no-go notes in `docs/reviews/mvp-launch-human-validation-checklist-2026-07-14.md`.
- Oversize upload error behavior still needs manual validation.
- Keyboard navigation and screen reader behavior were not fully audited.
- Admin metric labels such as Active, Review, and Not done still need Matthew's domain-language signoff.
- The global Add modal remains powerful and should be manually reviewed with a first-time admin.
- `origin` remote is still missing, so PR review cannot be prepared yet.

## Validation Log

- `pnpm lint`: passed.
- `pnpm test`: passed.
- `scripts/check-doc-links.sh`: passed.
- `pnpm db:review:reset`: passed against local Docker PostgreSQL.
- `pnpm exec playwright test tests/e2e/client-reporting.spec.ts --project=chromium`: passed, including client comment, mention text, upload constraint copy, blocked `.html` upload error, and `.txt` asset upload validation.
- `pnpm exec playwright test tests/e2e/admin-workflow.spec.ts --project=chromium`: passed.
- `pnpm build`: passed.
- Post-fix dev screenshot capture: passed.
- Production-like screenshot capture: passed after starting the built app with `.env` loaded through the new root `pnpm start` behavior.
- Production-like screenshot capture was refreshed after client-facing terminology changes.
- Production-like work item detail screenshots were refreshed after upload constraint guidance was added.

## Fresh-Eyes Follow-Up

A second fresh-eyes sub-agent reviewed the final production-like screenshots after the first fix pass. Its verdict was that the admin hierarchy is launch-readable and the client hierarchy is launch-usable for a limited MVP, with the largest remaining risk being terminology and expectation-setting.

Follow-up fixes completed from that review:

- Replaced client-facing detail labels such as "Work record," "User story," "Acceptance criteria," and "Business value" with "Request details," "Who needs this and why," "What would make this complete," and "Why it matters."
- Added client-facing status explanations on the request board and request detail page.

Remaining fresh-eyes risks that still need Matthew signoff:

- Admin metric wording may still be dense for a new admin.
- The global Add modal may still need a guided first-use pass.
- Mobile admin board discoverability should be manually checked on a real or emulated mobile viewport.

## Verdict

The highest-risk screenshot findings from the first review are addressed enough for Matthew's limited-MVP human validation pass. The project should not be called launch-ready until Matthew approves the production-like screenshots and completes the remaining manual accessibility and oversize-upload checks.
