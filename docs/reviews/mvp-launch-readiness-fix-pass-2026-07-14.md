# MVP Launch Readiness Fix Pass Review

Date: 2026-07-14

Status: ready for Matthew human validation; PR setup still blocked by missing `origin` remote

## Evidence

- Source review: `docs/reviews/mvp-launch-readiness-2026-07-14.md`
- Current screen/action inventory: `docs/reviews/mvp-launch-current-screen-action-inventory-2026-07-14.md`
- Human validation checklist: `docs/reviews/mvp-launch-human-validation-checklist-2026-07-14.md`
- Completion audit: `docs/reviews/mvp-launch-completion-audit-2026-07-14.md`
- PR review notes: `docs/reviews/mvp-launch-pr-review-notes-2026-07-14.md`
- Remote/PR runbook: `docs/reviews/mvp-launch-remote-pr-runbook-2026-07-14.md`
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
- Admin metric labels now use clearer launch language: "Open work" and "In review" instead of the denser "Active" and "Review" summary labels.
- The global Add modal now groups actions into Requests and Workspace, includes short action descriptions, exposes selected state with `aria-pressed`, and uses stable add-option test IDs.
- The global Add modal now waits for create actions to finish before closing, then refreshes the persistent app shell so newly created clients/projects are available for the next add action.
- Client Board/List summary and empty-state copy now consistently says "requests" instead of leaking internal "work item" language.
- Admin weekly Status report is included in the production-like screenshot inventory and generates copy/paste email text for planned, in-progress, and recently completed work. Admins can now generate it from the board using the current search, client/project, and type filters.
- Production-like screenshots do not show the dev overlay/issue badge.

## Remaining Launch Checks

- Matthew should review the production-like screenshots and run the app manually as both admin and client.
- Matthew should record final go/no-go notes in `docs/reviews/mvp-launch-human-validation-checklist-2026-07-14.md`.
- Oversize upload error behavior still needs manual validation.
- Keyboard navigation and screen reader behavior were not fully audited.
- Admin metric wording is improved, but Matthew should still sign off that "Open work," "In review," and "Not done" match DigiColony launch language.
- The global Add modal is clearer and the create workflow is covered by e2e, but it remains a high-power admin control and should be manually reviewed with a first-time admin.
- Weekly status report copy and status grouping should be reviewed by Matthew before sending externally.
- `origin` remote is still missing, so PR review cannot be prepared yet.

## Validation Log

- `pnpm lint`: passed.
- `pnpm test`: passed.
- `scripts/check-doc-links.sh`: passed.
- `pnpm db:review:reset`: passed against local Docker PostgreSQL.
- `pnpm exec playwright test tests/e2e/client-reporting.spec.ts --project=chromium`: passed, including client comment, mention text, upload constraint copy, blocked `.html` upload error, and `.txt` asset upload validation.
- `pnpm exec playwright test tests/e2e/admin-workflow.spec.ts --project=chromium`: passed.
- `PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm exec playwright test tests/e2e/admin-workflow.spec.ts --project=chromium --reporter=line`: passed against the rebuilt production server after modal submit/refresh fixes.
- `PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm exec playwright test tests/e2e/client-reporting.spec.ts --project=chromium --reporter=line`: passed against the rebuilt production server.
- `pnpm build`: passed.
- Post-fix dev screenshot capture: passed.
- Production-like screenshot capture: passed after starting the built app with `.env` loaded through the new root `pnpm start` behavior.
- Production-like screenshot capture was refreshed after client-facing terminology changes.
- Production-like work item detail screenshots were refreshed after upload constraint guidance was added.
- Production-like screenshots were refreshed again after admin metric wording and global Add modal hierarchy changes.
- Production-like client Board/List screenshots were refreshed after replacing the remaining client-facing "visible work" copy with "visible requests."
- Production-like screenshot capture was refreshed after adding `12-admin-status-report-desktop.png`; the clean evidence set now contains 22 screenshots.
- Production-like Status report screenshot was refreshed after clarifying that the report body is a generated preview and should be edited in email after copying.

## Fresh-Eyes Follow-Up

A second fresh-eyes sub-agent reviewed the final production-like screenshots after the first fix pass. Its verdict was that the admin hierarchy is launch-readable and the client hierarchy is launch-usable for a limited MVP, with the largest remaining risk being terminology and expectation-setting.

Follow-up fixes completed from that review:

- Replaced client-facing detail labels such as "Work record," "User story," "Acceptance criteria," and "Business value" with "Request details," "Who needs this and why," "What would make this complete," and "Why it matters."
- Added client-facing status explanations on the request board and request detail page.

Remaining fresh-eyes risks that still need Matthew signoff:

- Admin metric wording is now clearer, but Matthew should confirm it matches DigiColony's launch vocabulary.
- The global Add modal is now grouped and more explanatory, but first-time admin review remains appropriate because it can create multiple entity types.
- Mobile admin board discoverability should be manually checked on a real or emulated mobile viewport.

## Repeat Audit Loop Update

Matthew requested another audit-fix loop on 2026-07-14. This pass fixed or defended the remaining agent pushback as follows:

| Pushback | Resolution | Status |
| --- | --- | --- |
| Admin metrics used dense labels such as Active and Review. | Renamed summary metrics to "Open work" and "In review" while keeping "Not done" as supporting detail. | Fixed; Matthew domain-language signoff still requested. |
| Global Add modal was powerful for a first-time admin. | Grouped actions into Requests and Workspace, added short action descriptions, improved selected state, and refreshed screenshot evidence. | Fixed enough for limited-MVP validation; still worth a first-use manual pass. |
| Global Add creation flow could race with server actions or stale shell data. | Modal now closes only after create actions resolve and refreshes the app shell so newly created clients/projects are available immediately. Admin e2e now waits for successful close after create. | Fixed and covered by admin e2e. |
| Client Board/List still leaked "visible work" language. | Changed client summary, list count, and empty-state copy to use "visible requests" and "requests." | Fixed and refreshed in screenshots `16-client-board-desktop.png` and `17-client-list-desktop.png`. |
| Admin weekly status report was added after the prior audit. | Captured and reviewed `12-admin-status-report-desktop.png`; added it to the screen/action inventory and manual tone review checklist. | Fixed for inventory coverage; Matthew should approve copy tone before external use. |
| Destructive archive/delete controls needed safety review. | Existing controls already use confirmation prompts and danger styling. Archive remains visible in screenshots for Matthew's manual acceptance. | Defended for limited MVP; manual acceptance still listed. |
| Mobile admin board discoverability needed real-device review. | Status jump controls remain visible in the refreshed mobile screenshot. Agent cannot prove touch ergonomics from screenshot alone. | Defended as manual validation. |
| Sparse project context panels can feel unfinished when seeded context is light. | This is an acceptable limited-MVP content/data risk rather than a control hierarchy blocker. Seed/context richness should be reviewed manually before inviting pilot users. | Defended as content polish follow-up. |

## Repeat Fresh-Eyes Result

A repeat fresh-eyes sub-agent reviewed the refreshed production screenshot set and current review docs after the second fix pass. It found no new screenshot-visible blockers. Its remaining pushback was:

- First-time admin Add modal review remains the highest admin comprehension risk, but is defensible for limited MVP after grouping and e2e coverage.
- Admin metric/status vocabulary still needs Matthew's domain-language signoff.
- Client Board/List copy leaked one internal phrase; this was fixed after the review.
- Mobile admin board remains dense and should be validated on real or emulated mobile.
- Sparse context panels can feel unfinished when content is light; this is defended as seed/content polish rather than a launch blocker.

## Status Report Fresh-Eyes Addendum

A fresh-eyes sub-agent reviewed the newly added admin Status report screenshot and updated review docs. It found no new screenshot-visible blocker. Its only pushback was that the large report text area could make a first-time admin wonder whether edits there persist. The UI now clarifies that the report body is a generated preview and should be copied into email for edits before sending.

Remaining Status report checks:

- Matthew should approve report tone and status grouping before external use.
- Keyboard and focus behavior for `Copy report` and the report text area should be included in the manual accessibility spot check.

## Verdict

The highest-risk screenshot findings from the first review are addressed enough for Matthew's limited-MVP human validation pass. The project should not be called launch-ready until Matthew approves the production-like screenshots and completes the remaining manual accessibility and oversize-upload checks.
