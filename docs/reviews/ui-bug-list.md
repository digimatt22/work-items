# UI Bug List

## Blockers
- `DPAF-SOURCE-001`: External CTO Agent source repo missing. Expected path `/Users/mwood/Documents/DigiColony/CTO_Agent`; no `CTO_Agent` directory found under `/Users` at expected depth.
- `REVIEW-001`: Workspace is not a Git repository, so branch/PR review rules cannot be followed.

## High Priority
- `AUDIT-001`: `apps/web/app/workspaces/actions.ts` directly updates `client` and `user` records without shared service/audit path for update/delete behavior.
- `UX-001`: Archive/delete actions have no confirmation and weak danger styling.
- `UX-002`: Work item detail omits activity, edit, type-specific details, and status controls.
- `UX-003`: Mutation errors and pending states are not designed across forms.
- `UX-004`: Client-user flow lacks dedicated UX acceptance criteria.

## Medium Priority
- `UX-005`: Board card metadata is too thin for operational-memory scanning.
- `UX-006`: Filter precedence is not explained when project and client filters are both selected.
- `UX-007`: Upload UI hides file type, size, batch, and retry expectations.
- `UX-008`: Comment UI displays author id rather than human-readable author/timestamp.
- `UX-010`: Board drag/drop needs a keyboard or explicit non-pointer fallback before production accessibility acceptance.

## Low Priority
- `UI-001`: Repeated Tailwind markup should be extracted into reusable app/UI components.
- `UI-003`: Long form fields for bug/feature detail should use textareas.
- `UI-004`: KPI tiles and cards use repeated local styling instead of tokens/components.

## Resolved In Phase 1F Playwright Refinement
- `UI-002`: Sidebar now indicates the active route.
- `UI-005`: Critical primary actions and active nav no longer rely on the unreliable custom primary class path.
- `UI-006`: Mobile board metrics no longer clip horizontally.
- `UI-007`: Long work-item, client, and project labels are constrained in cards and metadata.
- `UI-008`: Board cards no longer expose repeated Start/Advance/Back/Done/status-select controls.
- `UI-009`: Board right rail, Today widget, Focus item, and always-visible create form were removed in favor of contextual column add controls.
- `UI-010`: Desktop sidebar account actions remain reachable in a sticky viewport-height rail.
- `UX-009`: Board creation now opens from a column add control and creates directly into that status.
- `UI-011`: App shell now has a single Global Add entry point for client, project, client user, and work-item creation.
- `UI-012`: Board status headers remain visible inside the board scroll area.
- `UX-011`: Client portfolio now surfaces clients, active projects, total work items, active work, and review load in a cleaner scannable layout.
