# Admin Weekly Status Report

## Status
- Status: completed locally
- Owner: Codex
- Branch: main
- PR: blocked until `origin` exists
- Last updated: 2026-07-14

## Summary
- Add an admin-only weekly status report screen.
- Generate concise email-ready copy that can be copied and pasted manually.
- Cover planned work, work in progress, and recently completed work.
- Out of scope: sending email automatically, scheduling, recipient management, or AI-generated prose.

## Work State
- Planned: None.
- In progress: None.
- Blocked: Remote/PR workflow remains blocked by missing `origin`.
- Needs human validation: Matthew should review report wording before using it with clients.
- Ready for review: Remote/PR review once `origin` exists.
- Completed: Admin `/status-report` route, copy control, nav entry, e2e coverage, screenshot-backed audit refresh, docs, and local validation.

## Decisions
- "Planned" maps to current `Reported` items.
- "In progress" maps to `In Progress` and `In Review` items.
- "Recently completed" maps to `Done` items updated in the last seven days.
- The first version is a deterministic report based on current database state, not an AI-authored summary.

## Implementation
- Add an admin-only `/status-report` route.
- Add sidebar navigation for admins.
- Add a client-side copy button for the generated report text.
- Keep client users redirected away from the admin report surface.

## Validation
- `pnpm lint`: passed.
- `pnpm test`: passed.
- `pnpm build`: passed.
- `PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm exec playwright test tests/e2e/status-report.spec.ts --project=chromium --reporter=line`: passed.
- `scripts/check-doc-links.sh`: passed.
- `scripts/check-current-state.sh`: expected to remain blocked by missing `origin`.
- Date checked: 2026-07-14.

## Human Validation
- Owner: Matthew.
- Exact steps: Sign in as admin, open Status, review the generated copy, paste it into an email draft, and confirm the tone and grouping are usable.
- Expected evidence: Go / revise wording notes.
- Evidence location: docs or PR notes once remote exists.
- Whether this blocks merge: It should block launch use of the report wording, but not the local implementation.

## Documentation
- `docs/ARCHITECTURE.md` updated for `/status-report`.
- `docs/REPO_MAP.md` updated for current app/test reality.
- Plan moved to completed after implementation and audit refresh were committed.

## Closeout
- Final status: ready for review locally.
- Merge or abandonment notes: Remote/PR path remains blocked until `origin` exists.
- Follow-up work items: Email sending, recipient templates, client/project filtering, report history, and richer date controls.
