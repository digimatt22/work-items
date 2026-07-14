# Review Data And Context Polish

## Status
- Status: planned
- Owner: Codex
- Branch: N/A; current workspace is not a Git repository
- PR: N/A
- Last updated: 2026-06-30

## Summary
- Create a clean, repeatable local review state for the admin workflow.
- Enrich seeded client, project, and work item context so review screens tell a realistic DigiColony operations story.
- Keep this goal scoped to local review readiness and existing schema; production deployment, Phase 2 AI automation, and large IA changes are out of scope.

## Work State
- Planned: reset or isolate E2E-generated data, improve seed/story content, verify board/client/project/detail review flow, and refresh review screenshots.
- In progress:
- Blocked: Git/PR workflow is unavailable because this folder is not a Git repository.
- Needs human validation: Matthew reviews whether the cleaned seed story matches expected DigiColony operating rhythm.
- Ready for review:
- Completed:

## Decisions
- Prefer a deterministic local reset path over manually deleting records from the UI.
- Preserve existing admin workflow coverage while preventing E2E artifacts from polluting normal review data.
- Prioritize meaningful client/project context and collaboration evidence before adding heavier board mechanics.

## Implementation
- Update seed or local reset workflow so `pnpm db:seed` produces a predictable MVP review dataset.
- Decide whether E2E-created records should be cleaned up after tests, namespaced away from review screens, or run against a separate database.
- Enrich seeded clients and projects with goals, operating summaries, structured context, and realistic activity/comment examples where existing schema supports it.
- Add or adjust docs so the review path clearly states how to reset the database and capture screenshots.
- Re-run the screenshot workflow and replace or archive the current noisy review captures.

## Validation
- `pnpm db:seed`
- `pnpm lint`
- `pnpm test`
- `pnpm exec playwright test tests/e2e/admin-workflow.spec.ts`
- `SCREENSHOT_DIR=docs/reviews/screenshots/<new-review-dir> pnpm screenshots:workflow`
- Manual visual inspection of desktop board, clients, client detail, project workspace, work item detail, and mobile board screenshots.

## Human Validation
- Owner: Matthew
- Steps: reset/seed local data, sign in as admin, review Board, Clients, a client detail page, a project workspace, and a seeded work item detail page.
- Expected evidence: notes on whether the cleaned review story reflects real DigiColony client operations and what is still missing before the next implementation pass.
- Evidence location: `docs/reviews/` or conversation summary copied into the plan.
- Blocks completion: yes for product acceptance; no for local technical validation.

## Documentation
- Update `docs/LOCAL_DEVELOPMENT.md`, `docs/MVP_REVIEW_CHECKLIST.md`, and affected active execution plans if review/reset commands change.
- Move this plan to `docs/exec-plans/completed/` after implementation and human review closeout.

## Closeout
- Final status: planned.
- Follow-up candidates: searchable filter controls, drawer/modal creation flows, richer client context editing, work item collaboration polish, and mobile board interaction refinement.

