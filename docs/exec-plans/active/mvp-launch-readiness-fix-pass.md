# MVP Launch Readiness Fix Pass

## Status
- Status: in progress
- Owner: Codex / Matthew
- Branch: main with local baseline commit
- PR: unavailable until `origin` remote is configured
- Last updated: 2026-07-14

## Summary
- Bring the admin and client experiences to a limited-launch MVP-ready state.
- Use the 2026-07-14 screenshot review and fresh-eyes review as the acceptance baseline.
- Focus on data cleanup, client-facing scope, visual clarity, and mobile comprehension before adding new product scope.

## Work State
- Planned: final human validation and PR setup after `origin` is configured.
- In progress:
- Blocked: PR workflow is unavailable until an `origin` remote is configured.
- Needs human validation: Matthew reviews the cleaned production-like capture and confirms limited-launch acceptance.
- Ready for review: code and docs are ready for Matthew's limited-MVP validation pass.
- Completed: Git initialized locally; initial local baseline commit created; launch-readiness screenshots captured; main and fresh-eyes reviews documented; current screen/action inventory added; human validation checklist added; completion audit added; PR review notes prepared; remote/PR setup runbook added; second fresh-eyes review completed; clean review reset command added; client route policy implemented; client-visible work filtering implemented; project-card clarity fixed; client copy polished; client-facing detail/status terminology fixed; mobile board status navigation added; client comment/upload e2e coverage added; upload constraints shown inline; blocked file-type upload errors made client-visible and automated; admin weekly Status report added and reviewed; production-like screenshot capture completed with 22 screenshots.

## Priority Fixes
1. Add a deterministic review reset command that removes E2E-created records and reseeds the intended launch-review story.
2. Decide and implement client route policy for `/clients`, `/clients/[clientId]`, `/projects/[projectId]`, and work-item visibility.
3. Remove client-facing internal/admin language and internal work items.
4. Fix project cards on client detail so names/details are visible in closed state.
5. Improve mobile board status navigation or default mobile users to a clearer list/status view.
6. Add useful empty states for sparse client/project context panels.
7. Standardize status and action language across board, list, portfolio, project, and detail screens.
8. Run a production-like screenshot capture without dev overlays.

## Validation
- `pnpm lint` passed on 2026-07-14.
- `pnpm test` passed on 2026-07-14.
- `scripts/check-doc-links.sh` passed on 2026-07-14.
- `pnpm db:review:reset` passed on 2026-07-14.
- `pnpm exec playwright test tests/e2e/client-reporting.spec.ts --project=chromium` passed on 2026-07-14.
- Client e2e coverage now validates client comments with mentions, upload constraint copy, blocked file-type upload error display, and allowed asset upload on a visible request.
- `pnpm exec playwright test tests/e2e/admin-workflow.spec.ts --project=chromium` passed on 2026-07-14.
- `PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm exec playwright test tests/e2e/status-report.spec.ts --project=chromium --reporter=line` passed on 2026-07-14.
- `pnpm build` passed on 2026-07-14.
- Post-fix dev screenshot capture passed: `docs/reviews/screenshots/mvp-launch-readiness-fix-pass-2026-07-14/`.
- Production-like screenshot capture passed: `docs/reviews/screenshots/mvp-launch-readiness-production-2026-07-14/`.
- Manual screenshot inspection confirmed clean data counts, visible client-detail project cards, client route redirects, client-only request board, client-facing request detail wording, client status explanations, admin weekly Status report copy/paste clarity, mobile status navigation, and no dev overlay in production-like screenshots.

## Human Validation
- Owner: Matthew
- Steps: review cleaned admin and client screenshots, then use the app as an admin and client user against the clean review dataset.
- Expected evidence: signoff notes on whether the app is ready for a limited MVP launch group.
- Blocks completion: yes.

## Documentation
- Source review: `docs/reviews/mvp-launch-readiness-2026-07-14.md`
- Current screen/action inventory: `docs/reviews/mvp-launch-current-screen-action-inventory-2026-07-14.md`
- Human validation checklist: `docs/reviews/mvp-launch-human-validation-checklist-2026-07-14.md`
- Completion audit: `docs/reviews/mvp-launch-completion-audit-2026-07-14.md`
- PR review notes: `docs/reviews/mvp-launch-pr-review-notes-2026-07-14.md`
- Remote/PR runbook: `docs/reviews/mvp-launch-remote-pr-runbook-2026-07-14.md`
- Screenshot evidence: `docs/reviews/screenshots/mvp-launch-readiness-2026-07-14/`
- Keep `docs/LOCAL_DEVELOPMENT.md`, `docs/MVP_REVIEW_CHECKLIST.md`, and relevant active plans aligned if commands or route policies change.

## Closeout
- Final status: ready for Matthew human validation; PR setup blocked by missing `origin` remote.
