# Admin Work Management UX Pass

## Status
- Status: ready for review
- Owner: Codex
- Branch: N/A; current workspace is not a Git repository
- PR: N/A
- Last updated: 2026-06-29

## Summary
- Move the product from scaffold/review pages toward a work-management app shape.
- Make the authenticated admin entry point the all-work Kanban board.
- Move client/project setup into a dedicated Clients section with account detail and user controls.

## Work State
- Planned: review-driven polish after Matthew evaluates the new information architecture.
- In progress:
- Blocked: Git/PR workflow is unavailable because this folder is not a Git repository.
- Needs human validation: compare the new Board and Clients workflows against expected DigiColony operating rhythm.
- Ready for review: Board-first landing, sidebar navigation, client/project portfolio, inline client/project/contact editing, main-board filtered project/client review, and list-view polish.
- Completed: retired Phase 0 home, retired MVP Review page, unauthenticated redirects to sign-in, checkbox-based multi-select board filters, Clients navigation, client detail page, inline edit affordances, removal of local add forms from client detail, removal of project-local board embedding, list-view count pill placement, and static work item list rows.

## Decisions
- Keep `/workspaces` and `/workspaces/[clientId]` as compatibility redirects to `/clients`.
- Keep `/mvp-review` as a redirect instead of deleting the route outright, avoiding broken links during transition.
- Use server-rendered forms and existing service/repository contracts for this pass; no drag-and-drop or schema migration yet.
- Use checkbox filter groups for MVP client/project filtering before introducing custom searchable combobox widgets.
- Keep create/manage forms available but collapsed by default so scan surfaces keep priority.

## Implementation
- `/` redirects authenticated users to `/work-items` and unauthenticated users to `/sign-in`.
- `/work-items` is now the primary Board surface with Kanban first, list second, and checkbox client/project multi-select filters.
- `/work-items?view=list` groups visible work by client/project, places count pills next to hierarchy titles, and shows work item rows directly with descriptions and detail links.
- Root layout now presents a signed-in sidebar with Board and Clients navigation.
- `/clients` shows the client portfolio, project hierarchy, work counts, and collapsed creation controls.
- `/clients/[clientId]` shows client context, projects, activity, and inline edit controls on client context, project cards, and contacts.
- `/projects/[projectId]` shows project context and a work summary, with project review linking to the main board filtered by project.
- Sign-in redirects to `/work-items`.

## Validation
- `pnpm lint` passed.
- `pnpm test` passed.
- `pnpm exec playwright test tests/e2e/admin-workflow.spec.ts` passed.
- `pnpm test:e2e` passed.
- `pnpm lint` passed after checkbox filters and collapsible forms.
- `pnpm test` passed after checkbox filters and collapsible forms.
- `pnpm exec playwright test tests/e2e/admin-workflow.spec.ts` passed after checkbox filters and collapsible forms.
- `pnpm test:e2e` passed after checkbox filters and collapsible forms.
- `pnpm --filter @digicolony/web lint` passed after list-view disclosure polish.
- `pnpm exec playwright test tests/e2e/admin-workflow.spec.ts` passed after list-view disclosure polish.

## Human Validation
- Owner: Matthew
- Steps: sign in as admin, confirm landing opens the Board, use client/project multi-select filters, navigate to Clients, review client/project hierarchy, open a client, edit context, create/edit/delete a test client user, open a project, create/move work.
- Expected evidence: notes on board scanability, filtering ergonomics, client detail usefulness, and whether custom modals/drawers are needed next.
- Blocks completion: no for the implementation goal; yes for product acceptance.

## Closeout
- Final status: implementation complete; pending hands-on UX review.
- Follow-up candidates: custom searchable comboboxes, modal/drawer creation flows, board swimlanes by client, richer client context schema, user deletion safeguards.
