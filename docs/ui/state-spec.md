# UI State Spec

## Empty States
- Board empty: explain that no visible work exists and offer Create work item for admins.
- Filter no-results: explain filters excluded all work and offer Clear filters.
- Client with no projects: current state exists; add Add project for admins.
- Work item with no comments/assets: current state exists; add short next action.

## Loading States
- Route-level loading files are not present.
- Add loading treatment for Board, Clients, Client detail, Project workspace, and Work item detail if data fetching becomes slow.
- Prefer skeleton rows/cards over spinners for board/list surfaces.

## Error States
- Add field-level errors for form validation.
- Add inline mutation errors for create, update, status movement, comment, and upload.
- Add permission-denied copy distinct from not-found copy where security allows.

## Success States
- Status movement, create, comment, and upload should have a visible success or resulting-state confirmation.
- Avoid toast-only success for critical actions; the resulting record should visibly update.

## Destructive States
- Archive client, archive project, and delete user require confirmation.
- Confirmation copy should name the affected record and state what happens to related projects/work.
- Hard delete of client users should be reconsidered before launch.

