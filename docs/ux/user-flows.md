# User Flows

## Flow: Admin Reviews And Moves Work
1. Admin signs in.
2. System redirects to `/work-items`.
3. Admin scans KPI tiles, filters, Kanban columns, and list rows.
4. Admin narrows by client, project, type, status, or search text.
5. Admin opens a work item or moves it directly from card/list controls.
6. System validates admin permission and records activity.

Recommended improvements:
- Add pending state to status controls.
- Add success/error feedback after movement.
- Add activity visibility on the item detail page.

## Flow: Admin Manages Client Portfolio
1. Admin opens `/clients`.
2. Admin scans clients, project counts, item counts, and active counts.
3. Admin expands New client or New project forms.
4. Admin opens a client detail page to manage context, projects, and users.
5. Admin edits client summary or adds/deletes users.

Recommended improvements:
- Add confirmation for archive/delete.
- Move direct client update/user update/delete behavior into shared services with activity.
- Show archived state and recovery policy before destructive actions.

## Flow: Admin Creates Project-Scoped Work
1. Admin opens a project workspace.
2. Admin uses the locked project create form.
3. Admin selects Bug or Feature.
4. Admin fills shared and type-specific fields.
5. System creates the item with default status and records activity.
6. Item appears on the project board.

Recommended improvements:
- Make type-specific detail fields multiline textareas where longer content is expected.
- Add field-level validation messages.
- Add post-create next action: view item, create another, or stay on board.

## Flow: Client User Reports Work
1. Client user signs in.
2. Client user sees only their client scope.
3. Client user creates a Bug or Feature.
4. Client user comments and uploads assets.
5. Client user sees non-AI activity and status. Status is read-only unless an admin grants that user `MOVE_WORK_ITEMS`.

Open questions:
- Client-user landing page is not explicitly designed.
- Client-user navigation labels may need different language than admin command-center language.
- Client-user ability to edit or archive submitted work is TBD.

## Flow: Comment And Upload Evidence
1. User opens a work item detail page.
2. User writes a comment; mentions are parsed and persisted.
3. User uploads one asset.
4. System validates permissions and asset constraints.
5. System records activity.

Recommended improvements:
- Support multi-file upload when the batch limit is fully implemented.
- Show accepted file types and max size near the file input.
- Show upload error text inline.
- Show comment author display name, timestamp, and mention chips.
