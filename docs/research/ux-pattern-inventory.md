# UX Pattern Inventory

## Product Surface
The current implementation is a server-rendered Next.js work-management app with:
- Authenticated sidebar shell.
- Board-first landing at `/work-items`.
- Clients portfolio at `/clients`.
- Client detail at `/clients/[clientId]`.
- Project workspace at `/projects/[projectId]`.
- Work item detail at `/work-items/[workItemId]`.
- Sign-in at `/sign-in`.

## Existing Patterns
- Dense header bands with KPI tiles.
- Kanban columns grouped by pipeline status.
- Secondary list view under the board.
- Checkbox-based client/project filters inside `details` disclosure controls.
- Collapsed create/manage forms in right-side panels.
- One-click Back/Advance controls plus direct status select.
- Work item detail page with comments and assets.

## Useful Patterns To Preserve
- Board-first authenticated entry point matches the admin operating rhythm.
- Separate Clients section keeps account setup away from delivery work.
- Project workspace gives a focused scope for creating and moving work.
- Collapsed setup forms protect scan density.
- Service-layer permission checks are already present for core work item and workspace actions.

## Pattern Gaps
- No standardized empty, loading, success, or error pattern.
- No confirmation pattern for destructive Archive/Delete actions.
- No pending/submitting feedback for server-action forms.
- No reusable component system for buttons, inputs, cards, badges, filter groups, page headers, or status controls.
- No visible comment count, asset count, or last activity on work cards.
- No work-item edit pattern, assignment pattern, release target pattern, watcher pattern, or label pattern in the UI.
- No keyboard shortcut or focus-management pattern beyond native controls.

## Recommended Pattern Direction
- Use native controls for the MVP, but wrap them in reusable components with consistent focus rings, disabled states, helper text, and error text.
- Prefer drawers or inline panels for create/edit flows only after server-action pending/error behavior is solved.
- Keep drag-and-drop as future-phase polish until accessible keyboard status movement, confirmation, and error recovery exist.

