# Client Reporting Entrypoint

## Status
- Status: ready for review
- Owner: Codex
- Branch: unavailable; this workspace is not inside a Git repository
- PR: unavailable until Git/remote setup is restored
- Last updated: 2026-06-30

## Summary
- Add a client-first reporting entry point so client users land on a simple issue submission flow instead of the admin work board.
- Preserve client access to the scoped board for project status visibility.
- Keep admin workflow behavior intact.
- Out of scope: richer post-submit notifications, production storage changes, and custom per-client form schemas.

## Work State
- Planned: Inspect auth, shell, work-item creation, permissions, asset upload, and validation coverage.
- In progress: None.
- Blocked: PR review cannot be prepared from this folder because `scripts/check-current-state.sh` reports it is not a Git repository.
- Needs human validation: Browser review of client-user reporting flow.
- Ready for review: `/report`, role-aware redirects, client navigation, attachment submission, tests, and docs are implemented and validated locally.
- Completed: Automated local validation is complete.

## Decisions
- Client users should land on `/report`; admins continue to land on `/work-items`.
- The reporting form creates normal `BUG` and `FEATURE` work items through existing shared service permissions.
- Attachments submitted with the report use the existing launch asset service and storage provider after work-item creation.
- The project selector is limited to projects visible to the signed-in user.

## Implementation
- Add a client report page and form under `apps/web/app/report/`.
- Add a report-specific server action that creates the work item and optional attachments.
- Make root and sign-in redirects role-aware through the existing root redirect path.
- Update `AppShell` navigation for client users.
- Add Playwright coverage for the client report flow.

## Validation
- Checks to run: `pnpm lint`; `pnpm test`; targeted Playwright if local services are available.
- Validation evidence and results:
  - `pnpm lint` passed on 2026-06-30.
  - `pnpm test` passed on 2026-06-30.
  - `pnpm db:start` passed on 2026-06-30.
  - `pnpm db:seed` passed on 2026-06-30.
  - `pnpm exec playwright test tests/e2e/admin-workflow.spec.ts --project=chromium` passed on 2026-06-30.
  - `pnpm exec playwright test tests/e2e/client-reporting.spec.ts --project=chromium` passed on 2026-06-30.
  - `pnpm exec playwright test --project=chromium` passed on 2026-06-30; 8 tests passed.
  - After test selector cleanup, `pnpm lint` and `pnpm exec playwright test tests/e2e/client-reporting.spec.ts --project=chromium` passed again on 2026-06-30.
  - `scripts/check-doc-links.sh` passed on 2026-06-30.
  - `scripts/check-current-state.sh` failed on 2026-06-30 because `/Users/matt/Documents/work-items` is not inside a Git repository.
- Note: `pnpm prisma:migrate` reached an interactive `migrate dev` prompt even though `prisma migrate status` reported the database schema is up to date. Use the non-interactive status check for validation unless a new migration is intentionally being created.
- What cannot be validated locally: full PR/remote workflow because this folder is not currently a Git checkout.
- Date checked: 2026-06-30.

## Human Validation
- Owner: Matthew or DigiColony reviewer.
- Exact steps: Sign in as `client@digicolony.local`, confirm `/report` is the landing page, submit a bug and a feature with and without attachments, then review the created items on the board.
- Expected evidence: Submitted items appear in the Reported column and attachments appear on the work item detail page.
- Evidence location: PR notes or this plan until PR setup is available.
- Whether this blocks merge: Yes for production use; no for local prototype review.

## Documentation
- Update `docs/ARCHITECTURE.md` for the client reporting entry contract.
- Update this execution plan with validation results and PR caveat.
- Move to completed only after review/merge or explicit local-only closeout.

## Closeout
- Final status: ready for review pending human browser review and Git/PR setup.
- Merge or abandonment notes: PR cannot be opened from this workspace until it is restored to a Git checkout or copied into the intended repository.
- Follow-up work items: Consider per-client form customization and post-submit confirmation UX.
