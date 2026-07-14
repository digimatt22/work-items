# Page Re-Imagination Spec

## Objective
Re-imagine every existing page using the DPAF specialist outputs plus the Pickolab task dashboard reference. The result should feel like a focused client-operations command center: calm, modern, data-rich, and ready for Codex implementation.

## Global Shell
### Desktop
- Keep a fixed left rail around 252px wide, inspired by the reference.
- Use active-route pill styling for Board and Clients.
- Add top-right account/notification affordances only when they map to real behavior; otherwise keep profile/sign-out simple.
- Use a three-zone grid where useful:
  - Left rail: navigation and session controls.
  - Main canvas: primary workflow.
  - Right rail: context, selected item details, filters, or creation panels.

### Mobile
- Replace left rail with a top app bar containing menu, page title, and account action.
- Stack right-rail content below the primary workflow.
- Keep board columns horizontally scrollable only if there is a clear accessible fallback list.

## `/sign-in`
### Re-imagined Direction
- Use a centered auth card with a small product mark and production-facing sign-in copy.
- Borrow the reference's soft background, rounded card, and blue-violet primary button.
- Add inline error, pending, and helper text states.

### Implementation Notes
- Do not show environment-specific credential hints in the product UI.
- Use a `FormField`, `Button`, and `Alert` component from the new UI layer.

## `/work-items`
### Re-imagined Direction
- Treat this as the primary command center.
- Main area:
  - Page header: greeting/status line, "Board", active work summary.
  - KPI cards: active, in review, blocked/needs input if available, done this week if available.
  - Work board: compact cards with status, type, client/project, comments/assets, updated time, assignee/reporter.
  - List view below or behind a tab once tabs are available.
- Right rail:
  - Date/focus strip inspired by the reference calendar.
  - "Today / selected work item" panel showing details for the currently selected card or most urgent item.
  - Create work item panel or filter summary, depending on screen width.

### Implementation Notes
- Keep URL-backed filters.
- Add no-results recovery with clear filters.
- Do not add drag-and-drop until keyboard-accessible status movement and error recovery exist.

## `/clients`
### Re-imagined Direction
- Make this a portfolio dashboard rather than a flat card list.
- Main area:
  - Client portfolio header with project/work metrics.
  - Client cards as compact account tiles with progress/activity signals.
  - Project previews nested inside client cards with clearer hierarchy.
- Right rail:
  - New client/new project actions.
  - "Needs attention" list: clients with active review work, no projects, or stale activity.

### Implementation Notes
- Archive client requires confirmation.
- Client cards should use count badges and status chips instead of plain text-only metrics.

## `/clients/[clientId]`
### Re-imagined Direction
- Use the reference's detail-panel language for client operational memory.
- Main area:
  - Client header with account summary, active projects, active work, users.
  - Project cards with progress bars and latest activity.
  - Activity timeline with human-readable actor/action/time.
- Right rail:
  - Client context panel.
  - Client users panel.
  - Admin-only edit controls.

### Implementation Notes
- Move client update and client-user mutations through shared services with activity.
- Add confirmation for delete/deactivate user.
- Add structured context editor later; for this pass, improve display and preserve JSON fallback.

## `/projects/[projectId]`
### Re-imagined Direction
- Make project workspace feel like a scoped mini-dashboard.
- Main area:
  - Project header with client breadcrumb, active/done/review counts.
  - Project board in compact columns.
  - Recent activity and recent comments/assets preview if available.
- Right rail:
  - Locked-project work item creation.
  - Project context and quick filters.

### Implementation Notes
- Keep locked project create behavior.
- Use multiline type-specific fields.
- Show upload/comment counts on project work cards.

## `/work-items/[workItemId]`
### Re-imagined Direction
- This should become the strongest "operational memory" page.
- Main area:
  - Work item header with status chip, type, client/project, reporter/creator, created/updated.
  - Description and type-specific details.
  - Activity timeline.
  - Comments as the primary collaboration stream.
- Right rail:
  - Status movement controls when permitted.
  - Assets panel with upload constraints, previews/metadata, and retry errors.
  - Context/summary panel when available.

### Implementation Notes
- Add edit entry points for approved fields only.
- Add pending/error states for comment and upload.
- Client users must not see AI audit/action metadata.

## `/workspaces` And `/mvp-review`
### Re-imagined Direction
- Keep as compatibility redirects only.
- Do not redesign unless the product decides to keep them.

## Future Phase: Governance
### Re-imagined Direction
- Add a third sidebar item only when Phase 2 ships.
- Governance should contain AI audit, MCP clients/tokens, summary provenance, and admin-only agent activity.
- Use strong admin-only visual language distinct from client-visible progress.
