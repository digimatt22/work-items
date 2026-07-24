# Basic Usage MVP Review Checklist

Use this checklist after Phase 1E validation. The live database path validates persistence and authenticated seeded flows.

## Retired Review Surfaces

- `/` no longer renders the Phase 0 harness page.
- `/mvp-review` no longer renders the static review checkpoint.
- Unauthenticated product routes redirect to `/sign-in`.
- Authenticated sign-in lands on `/work-items`.

## Usable Admin Workflow Checkpoint

The live local database path now supports a more complete admin review:

- Seeded clients, projects, and work items across multiple statuses.
- Admin login with local database credentials.
- Sidebar navigation with Board and Clients sections.
- Workspace dashboard with client/project/work item counts.
- Client workspace drill-in with projects and client-safe activity.
- Project workspace drill-in with scoped work items and status lanes.
- Delivery board with Kanban-style status lanes as the primary screen.
- Delivery board filters by search text, checkbox-selected clients, checkbox-selected projects, type, and status.
- Client portfolio page with clients and projects grouped together.
- Client detail page with context, project list, activity, and client user management.
- Collapsed contextual create client, create project, create client user, and client edit forms.
- Work item creation switches between Bug-specific and Feature-specific detail fields.
- Status movement for admins and client users individually granted `MOVE_WORK_ITEMS`.
- Board cards support one-click Back/Advance movement plus direct status selection.
- Work item detail view with comments and assets.
- Auth-aware shell with sign-out.
- Automated authenticated e2e coverage for the admin workflow.

## Local Database Readiness

1. Copy `config/local-development.example` to `.env`.
2. Start PostgreSQL and ensure `DATABASE_URL` points at it. If Docker is available:
   ```sh
   pnpm db:start
   ```
3. Reset to the clean local review story:
   ```sh
   pnpm db:review:reset
   pnpm dev
   ```
   `pnpm db:review:reset` is destructive. Use it only against the local review
   database named in `.env`.
4. Sign in with:
   - `admin@digicolony.local`
   - `client@digicolony.local`
   - password from `SEED_DEFAULT_PASSWORD`

## Review Flows

- Admin can view workspace shell.
- Admin can create a client.
- Admin can create a project.
- Admin can open a project workspace from a client portfolio or detail view.
- Admin can open a client detail page and manage client context.
- Admin can create a client user.
- Admin can edit and delete client users.
- Admin can grant or revoke a client user's ability to move visible work items.
- Client user lands on Report, can use the request Board, and is redirected away from admin-only Clients/Project Workspace routes.
- User can create a Bug work item.
- User can create a Feature work item.
- Admin can move work item status.
- A permitted client user can move their visible work item status; a client user without the grant cannot.
- Admin can filter the work item board by search text, client, project, type, or status.
- User can comment on a work item.
- Mentions are persisted from comment text.
- User can see allowed file types and max upload size before selecting an asset.
- User can upload an allowed asset.
- User sees an inline error for a blocked file type.
- Client users do not see AI action details.

## UX Review Prompts

- Does the workspace shape match how DigiColony expects to manage client engagements?
- Are client and project boundaries obvious enough?
- Does the Board-first landing make system work state obvious within a few seconds?
- Are the checkbox client/project filters good enough for MVP, or do they need searchable comboboxes?
- Does the Clients section feel like the right home for account setup and context?
- Do collapsed setup controls reduce enough visual clutter, or should creation move into drawers/modals next?
- Does work item creation ask for the right amount of information?
- Does the mode-aware Bug/Feature form feel fast enough, or should Bug and Feature become separate creation entry points?
- Does Kanban/List behavior feel useful enough for MVP?
- Does one-click Back/Advance status movement feel sufficient for launch, or is drag-and-drop necessary before first real usage?
- Are activity and audit concepts represented clearly without exposing AI internals to clients?

## Automated Workflow Evidence

The e2e suite includes an authenticated admin workflow that signs in, creates a client, creates a project, opens the project workspace, creates a work item, moves status, and verifies the filtered/searchable work item board.

The client e2e suite signs in as a client user, verifies admin-only route redirects, creates bug and feature requests, adds a comment containing a mention, verifies a blocked `.html` upload error, and attaches an allowed `.txt` asset to a visible request.

## Known Environment Gap

The current local environment has run seeded authenticated workflows against Docker PostgreSQL. If Docker Desktop is unavailable on this machine, local database validation will need either a running PostgreSQL service or a future non-Docker fallback.
