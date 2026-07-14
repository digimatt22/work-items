# Usable Admin Workflow MVP

## Status
- Status: ready for review
- Owner: Codex
- Branch: N/A; current workspace is not a Git repository
- PR: N/A
- Last updated: 2026-06-26

## Summary
- Add enough seeded data and UI polish for an admin to review a usable client operations workflow.
- Support login, client/project browsing, creating clients/projects/work items, and moving work item states.
- Keep this phase scoped to existing schema and launch contracts; no production deployment or Phase 2 AI automation work.

## Work State
- Planned:
- In progress:
- Blocked: Git/PR workflow is unavailable because this folder is not a Git repository.
- Needs human validation: product fit and UI/workflow review in the running app.
- Ready for review: admin login/sign-out, seeded clients/projects/work items, create client, create project, project-level work review, create work item, filtered board review, and status movement.
- Completed: richer seed data, workspace polish, project workspace polish, work item board polish, board search/filter controls, mode-aware Bug/Feature creation forms, one-click board status movement, auth-aware shell, work item detail polish, live validation, and automated authenticated workflow coverage.

## Decisions
- Keep PostgreSQL/Docker as the local persistence path now that Docker Engine is running.
- Avoid a new schema migration for this usability pass.
- Use Trello/Monday/Targetprocess-inspired patterns: dense overview, status columns, compact project/client summaries, and fast inline movement.

## Implementation
- Enrich seed data with multiple clients, projects, and work items across statuses.
- Enrich repository records with client/project display names and status colors.
- Polish `/workspaces`, `/workspaces/[clientId]`, `/projects/[projectId]`, `/work-items`, and `/work-items/[workItemId]`.
- Add board filtering by search text, client, project, type, and status, plus project links into filtered board views.
- Replace duplicated work item creation forms with a mode-aware Bug/Feature form that shows only relevant detail fields.
- Add one-click Back/Advance status controls to project and delivery board cards while preserving direct status selection.
- Add auth-aware shell state and sign-out action.
- Add a project workspace that scopes work item review, creation, and status movement to one project.
- Add an authenticated Playwright e2e spec for the admin workflow.

## Validation
- `pnpm db:seed` passed against local Docker PostgreSQL.
- `pnpm lint` passed.
- `pnpm test` passed.
- `pnpm test:e2e` passed.
- Authenticated Chrome smoke passed: admin signed in, created a client, created a project, created a work item, and moved its status.
- Authenticated Chrome smoke passed for filtered project board and sign-out.
- Authenticated Chrome smoke passed for `/projects/seed-project-client-portal`: opened scoped project board, created a project-scoped work item, and moved its status.
- `pnpm test` passed after project workspace addition.
- `pnpm test:e2e` passed after project workspace addition.
- `pnpm test:e2e` now includes an authenticated browser workflow covering admin login, client creation, project creation, project workspace review, work item creation, status movement, filtered board visibility, and search/type filtering.
- `pnpm lint` passed after mode-aware work item form extraction.
- `pnpm test` passed after mode-aware work item form extraction.
- `pnpm exec playwright test tests/e2e/admin-workflow.spec.ts` passed after mode-aware work item form extraction.
- `pnpm test:e2e` passed after mode-aware work item form extraction.
- `pnpm lint` passed after one-click board status controls.
- `pnpm test` passed after one-click board status controls.
- `pnpm exec playwright test tests/e2e/admin-workflow.spec.ts` passed after one-click board status controls.
- `pnpm test:e2e` passed after one-click board status controls.

## Human Validation
- Owner: Matthew
- Steps: sign in as admin, review `/workspaces`, open a client, open a project workspace, review `/work-items`, filter board by search/client/project/type/status, create client/project/work item, move statuses, sign out.
- Expected evidence: notes on workflow fit, UI clarity, missing fields, and next MVP gaps.
- Evidence location: conversation or future review doc.
- Blocks merge: yes, for product acceptance; no, for local implementation progress.

## Documentation
- Keep this active plan current.
- Move to completed after validation and closeout.

## Closeout
- Final status: ready for Matthew's hands-on MVP workflow review.
- Follow-up work items: capture review notes on UI density, missing work item fields, project/client detail needs, filter behavior, and whether status movement should become drag-and-drop.
