# Component Spec

## Button
- Variants: primary, secondary, ghost, danger.
- States: default, hover, focus-visible, disabled, pending.
- Requirements: stable height, accessible name, no layout shift when pending.

## Form Field
- Includes label, control, helper text, error text.
- States: default, focused, disabled, invalid, pending.
- Requirements: errors appear near the field and preserve entered values where possible.

## Page Header
- Includes eyebrow, title, description, optional metrics, optional actions.
- Requirements: metrics wrap cleanly on small screens; heading hierarchy stays one `h1` per page.

## Work Item Card
- Includes title, client/project, type, status, optional assignee, comment count, asset count, updated time, and status controls when permitted.
- States: default, hover/focus, pending status move, failed status move, empty-column context.
- Requirements: status is text plus color; card has a detail link.

## Filter Panel
- Includes search, client/project selectors, type/status selectors, Apply/Clear, active chips.
- States: no filters, filters active, no results, invalid combination.
- Requirements: selected project filters should explain when they override broader client filters.

## Client Card
- Includes client name, description, project count, item count, active count, open-board action, archive action if permitted.
- States: normal, empty projects, archive confirmation, archived hidden from active list.

## Work Item Detail
- Includes title, description, status, client, project, created time, type-specific details, comments, assets, activity, and edit/status actions by permission.
- States: loading, not found/out of scope, save pending, upload failed, comment failed.

