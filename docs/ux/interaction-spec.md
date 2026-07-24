# Interaction Spec

## Status Movement
- Current: Admins can move work; client users see status only unless granted `MOVE_WORK_ITEMS`, which enables board drag/drop and detail status controls for their visible requests.
- Required behavior: server-side permission check, activity write, revalidation of board/detail/project routes.
- Recommended next behavior: pending state, inline error recovery, and keyboard-accessible status controls.
- Future behavior: drag-and-drop only after equivalent keyboard status movement and error recovery exist.

## Filters
- Current: Text search, type select, status select, checkbox client/project groups, Apply/Clear.
- Recommended next behavior: visible active-filter chips for all filter types, one-click removal per chip, no-results recovery, persisted filter state in URL.
- Risk: `clientIds` and `projectIds` can both be active; project filtering currently takes precedence over client filtering.

## Comments
- Current: Required textarea; mentions parsed as `@token`; author id displayed.
- Recommended next behavior: display author name/email, timestamp, mention styling, empty state, edit policy, delete policy, and pending/error state.
- Open question: Are comment edits allowed for launch?

## Uploads
- Current: Single file input; service validates extension and size; asset metadata listed.
- Recommended next behavior: explain accepted file types and max size, support batch uploads when ready, inline validation errors, image preview thumbnails, download links, retry on failed upload.
- Open question: Should project-level assets ship in the next implementation pass or remain work-item-only in UI?

## Editing
- Current: Client and client users can be edited; work item edit is not implemented.
- Recommended next behavior: work item edit panel with shared fields and type-specific fields; all edits must go through shared services and record activity.

## Keyboard Behavior
- Current: mostly native links, forms, selects, and disclosure widgets.
- Required next behavior: visible focus states on all interactive controls, keyboard-accessible disclosure content, stable tab order through board cards and forms.
- Future behavior: documented shortcuts only after core keyboard access is verified.

## Optimistic UI And Recovery
- Current: server-action submits rely on navigation/revalidation; no optimistic UI is visible.
- Recommended launch behavior: use pending state and disable duplicate submits; show errors inline when possible.
- Future behavior: optimistic card movement with rollback after accessible pending/error behavior is in place.
